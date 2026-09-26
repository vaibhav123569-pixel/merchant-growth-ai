import {existsSync,openSync} from 'node:fs';
import {mkdir,readFile,writeFile,copyFile,readdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {setupLocalAI} from './setup-local-ai.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);
process.env.PATH=[path.dirname(process.execPath),path.join(root,'node_modules','.bin'),process.env.PATH].join(path.delimiter);
const children=[];
function run(args){return new Promise((resolve,reject)=>{const p=spawn(process.execPath,args,{stdio:'inherit',windowsHide:true});p.on('exit',code=>code===0?resolve():reject(new Error(`Setup step failed (${code}).`)));p.on('error',reject);});}
async function health(url,validate=()=>true){try{const r=await fetch(url,{signal:AbortSignal.timeout(1500)});return r.ok&&validate(await r.json());}catch{return false;}}
function close(){for(const child of children)child.kill();process.exit();}process.on('SIGINT',close);process.on('SIGTERM',close);
try{
 if(!existsSync('node_modules/vinext'))throw new Error('Install Node.js 22 or newer, open this folder in a terminal and run npm ci once, then open this launcher again.');
 if(!existsSync('.dev.vars'))await copyFile('.dev.vars.example','.dev.vars');
 const settings=await readFile('.dev.vars','utf8');
 if(/^LLM_PROVIDER=local/m.test(settings)){
  const model=await setupLocalAI();
  if(!await health('http://127.0.0.1:8081/health')){
   const log=openSync('.local-ai/model.log','a');
   const server=spawn(model.executable,['-m',model.model,'--host','127.0.0.1','--port','8081','--ctx-size','4096','--threads','4','--parallel','1','--alias','merchant-local','--jinja','--cors-origins','http://localhost:5173','--reasoning','off'],{windowsHide:true,stdio:['ignore',log,log]});children.push(server);
   console.log('Loading your local AI model...');let ready=false;for(let i=0;i<60;i++){if(await health('http://127.0.0.1:8081/health')){ready=true;break;}if(server.exitCode!==null)throw new Error('Model server stopped. Read .local-ai/model.log.');await new Promise(r=>setTimeout(r,1000));}if(!ready)throw new Error('The model did not become ready. Read .local-ai/model.log.');
  }
  console.log('Local AI is ready. No API key is needed.');
 }
 if(await health('http://localhost:5173/api/evidence',d=>d.id==='SAT-1400-1700-v1')){console.log('Merchant Growth AI is already running at http://localhost:5173/');if(children.length)await new Promise(()=>{});process.exit(0);}
 console.log('Preparing the application...');await run(['scripts/run-framework.mjs','build']);
 await mkdir('.wrangler',{recursive:true});let applied=[];try{applied=JSON.parse(await readFile('.wrangler/local-migrations.json','utf8'));}catch{}
 for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort()){
  if(applied.includes(file))continue;
  await run(['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--file',`drizzle/${file}`]);applied.push(file);await writeFile('.wrangler/local-migrations.json',JSON.stringify(applied));
 }
 const app=spawn(process.execPath,['scripts/run-framework.mjs','dev','--port','5173'],{stdio:'inherit',windowsHide:true});children.push(app);
 console.log('Open http://localhost:5173/ when the app is ready. Keep this window open; Ctrl+C stops the app and model.');app.on('exit',close);
}catch(error){console.error(error.message);for(const child of children)child.kill();process.exitCode=1;}

