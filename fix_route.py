
import sys

code = """import {db,json,user,sameOrigin,readJson} from "@/lib/server";

export async function GET(request:Request) {
    try {
        const u = await user(request);
        if (!u) return json({error:"Sign in to view saved actions."}, 401);
        
        const r = db().prepare("SELECT id,title,offer,budget,status,counts,updated FROM actions WHERE user_id=? ORDER BY updated DESC").all(u.id) as any[];
        
        return json({ actions: r.map((a: any) => ({ ...a, counts: JSON.parse(a.counts as string) })) });
    } catch {
        return json({error:"Could not load saved actions. Please retry."}, 503);
    }
}

export async function POST(request:Request) {
    try {
        if (!sameOrigin(request)) return json({error:"Invalid origin."}, 403);
        const u = await user(request);
        if (!u) return json({error:"Sign in to save an action."}, 401);
        
        const b = await readJson(request) as {id:string,title:string,offer:string,budget:number,status:string,counts:(number|null)[]};
        
        if (typeof b.id!=="string"||b.id.length>80||typeof b.title!=="string"||b.title.trim().length<3||b.title.length>100||typeof b.offer!=="string"||b.offer.trim().length<5||b.offer.length>1000||!Number.isInteger(b.budget)||b.budget<0||b.budget>100000||!["draft","approved","reviewed"].includes(b.status)||!Array.isArray(b.counts)||b.counts.length!==3||b.counts.some((n:unknown)=>n!==null&&(!Number.isInteger(n)||Number(n)<0||Number(n)>10000))) return json({error:"Check the title, offer, budget and three daily counts (0–10,000)."}, 400);
        if (b.status==="reviewed"&&b.counts.some((n:unknown)=>n===null)) return json({error:"Enter all three daily counts before reviewing."}, 400);
        
        const owner = db().prepare("SELECT user_id,status FROM actions WHERE id=?").get(b.id) as {user_id:string,status:string} | undefined;
        if (owner && owner.user_id!==u.id) return json({error:"Action unavailable."}, 403);
        if (b.status==="reviewed"&&(!owner||owner.status==="draft")) return json({error:"Approve the saved experiment before reviewing it."}, 400);
        
        if (!owner) {
            const n = db().prepare("SELECT count(*) AS n FROM actions WHERE user_id=?").get(u.id) as {n:number};
            if ((n?.n||0)>=100) return json({error:"This demo supports up to 100 actions per account."}, 400);
        }
        
        db().prepare("INSERT INTO actions(id,user_id,title,offer,budget,status,counts,updated) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,offer=excluded.offer,budget=excluded.budget,status=excluded.status,counts=excluded.counts,updated=excluded.updated WHERE actions.user_id=excluded.user_id").run(b.id,u.id,b.title.trim(),b.offer.trim(),b.budget,b.status,JSON.stringify(b.counts),Date.now());
        
        return json({ok:true});
    } catch(error) {
        if (error instanceof Error&&error.message==="INVALID_INPUT") return json({error:"Send a valid JSON object smaller than 16 KB."}, 400);
        return json({error:"Your action could not be saved. Your draft is still on screen; please retry."}, 503);
    }
}
"""

with open("app/api/actions/route.ts", "w", encoding="utf-8") as f:
    f.write(code)

print("Fixed route.ts for better-sqlite3 API")

