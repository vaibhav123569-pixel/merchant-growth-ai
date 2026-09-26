import sys

# db/index.ts
db_index = """import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("sqlite.db");

export function getDb() {
  return drizzle(sqlite, { schema });
}
"""

with open("db/index.ts", "w", encoding="utf-8") as f:
    f.write(db_index)

# lib/server.ts
server_ts = """import Database from "better-sqlite3";

const sqlite = new Database("sqlite.db");
export const db = () => sqlite;

export const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

export const digest = async (s: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))).map(n => n.toString(16).padStart(2, "0")).join("");

export async function hashPassword(password: string, salt: string) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    return Array.from(new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256))).map(n => n.toString(16).padStart(2, "0")).join("");
}

export async function user(request: Request) {
    const token = request.headers.get("cookie")?.match(/(?:^|;\\s*)mg_session=([^;]+)/)?.[1];
    if (!token) return null;
    return db().prepare("SELECT users.id, users.email, users.name, users.demo FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token=? AND sessions.expires>?").get(await digest(token), Date.now()) as { id: string, email: string | null, name: string, demo: number } | undefined;
}

export function sameOrigin(request: Request) {
    const origin = request.headers.get("origin");
    return !origin || origin === new URL(request.url).origin;
}

export async function session(request: Request, id: string) {
    const token = crypto.randomUUID() + crypto.randomUUID();
    db().prepare("INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)").run(await digest(token), id, Date.now() + 7 * 86400000);
    return `mg_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}

export async function throttle(key: string, limit = 10) {
    const now = Date.now();
    db().prepare("INSERT INTO attempts(key,count,until) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN until<? THEN 1 ELSE count+1 END, until=CASE WHEN until<? THEN excluded.until ELSE until END").run(key, now + 15 * 60000, now, now);
    const row = db().prepare("SELECT count FROM attempts WHERE key=?").get(key) as { count: number } | undefined;
    return (row?.count || 0) > limit;
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
    const text = await request.text();
    if (text.length > 16384) throw new Error("INVALID_INPUT");
    try {
        const data = JSON.parse(text);
        if (!data || Array.isArray(data) || typeof data !== "object") throw new Error("invalid");
        return data;
    } catch {
        throw new Error("INVALID_INPUT");
    }
}
"""

with open("lib/server.ts", "w", encoding="utf-8") as f:
    f.write(server_ts)

print("Migrated D1 to better-sqlite3 in code.")
