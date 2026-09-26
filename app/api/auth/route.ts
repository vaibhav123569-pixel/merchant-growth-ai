import {db,json,user,sameOrigin,session,digest,hashPassword,throttle,readJson} from "@/lib/server";
export async function GET(request:Request){try{return json({user:await user(request)});}catch{return json({error:"Account storage is unavailable. Please try again."},503);}}
export async function POST(request:Request){try{
 if(!sameOrigin(request))return json({error:"Invalid request origin."},403);
 if(Number(request.headers.get("content-length"))>10000)return json({error:"Request too large."},413);
 const b=await readJson(request) as Record<string,string>;const mode=b.mode;
 if(mode==="logout"){const token=request.headers.get("cookie")?.match(/(?:^|;\s*)mg_session=([^;]+)/)?.[1];if(token)await db().prepare("DELETE FROM sessions WHERE token=?").bind(await digest(token)).run();return Response.json({ok:true},{headers:{"Set-Cookie":"mg_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0","Cache-Control":"no-store"}});}
 if(!["demo","login","register","password"].includes(mode))return json({error:"Unknown account action."},400);
 if(mode==="password"){
  const current=await user(request);if(!current||current.demo)return json({error:"Sign in with a registered account to change your password."},401);
  if(await throttle("password:"+current.id))return json({error:"Too many attempts. Try again in 15 minutes."},429);
  const row=await db().prepare("SELECT hash,salt FROM users WHERE id=?").bind(current.id).first<{hash:string,salt:string}>();
  if(!row||typeof b.current!=="string"||await hashPassword(b.current,row.salt)!==row.hash)return json({error:"Current password is incorrect."},400);
  if(typeof b.password!=="string"||b.password.length<10||b.password.length>128)return json({error:"Use a password between 10 and 128 characters."},400);
  const salt=crypto.randomUUID(),hash=await hashPassword(b.password,salt);await db().batch([db().prepare("UPDATE users SET hash=?,salt=? WHERE id=?").bind(hash,salt,current.id),db().prepare("DELETE FROM sessions WHERE user_id=?").bind(current.id)]);return Response.json({ok:true},{headers:{"Set-Cookie":await session(request,current.id),"Cache-Control":"no-store"}});
 }
 const ip=request.headers.get("cf-connecting-ip")||"local";if(await throttle("ip:"+ip,60))return json({error:"Too many attempts. Try again in 15 minutes."},429);
 if(mode==="demo"){const id=crypto.randomUUID();await db().prepare("INSERT INTO users(id,name,demo,created) VALUES(?,?,1,?)").bind(id,"Vabhav's store",Date.now()).run();return Response.json({user:{id,name:"Vabhav's store",demo:1}},{headers:{"Set-Cookie":await session(request,id),"Cache-Control":"no-store"}});}
 const email=typeof b.email==="string"?b.email.trim().toLowerCase():"";const password=b.password;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof password!=="string"||password.length<10||password.length>128)return json({error:"Enter a valid email and a password of 10–128 characters."},400);
 if(await throttle("email:"+await digest(email)))return json({error:"Too many attempts. Try again in 15 minutes."},429);
 const existing=await db().prepare("SELECT * FROM users WHERE email=?").bind(email).first<{id:string,name:string,email:string,hash:string,salt:string,demo:number}>();let account;
 if(mode==="register"){
  if(existing)return json({error:"This email is already registered. Please sign in."},409);
  const name=typeof b.name==="string"?b.name.trim():"";if(name.length<2||name.length>60)return json({error:"Enter a shop name between 2 and 60 characters."},400);
  const id=crypto.randomUUID(),salt=crypto.randomUUID(),hash=await hashPassword(password,salt);await db().prepare("INSERT INTO users(id,email,name,hash,salt,demo,created) VALUES(?,?,?,?,?,0,?)").bind(id,email,name,hash,salt,Date.now()).run();account={id,name,email,demo:0};
 }else{const calculated=await hashPassword(password,existing?.salt||"invalid-account-salt");if(!existing||calculated!==existing.hash)return json({error:"Email or password is incorrect."},401);account={id:existing.id,name:existing.name,email:existing.email,demo:existing.demo};}
 return Response.json({user:account},{headers:{"Set-Cookie":await session(request,account.id),"Cache-Control":"no-store"}});
 }catch(error){if(error instanceof Error&&error.message==="INVALID_INPUT")return json({error:"Send a valid JSON object smaller than 16 KB."},400);console.error("Auth operation failed",error instanceof Error?error.message:"unknown");return json({error:"Could not complete that request. Please try again."},503);}}

