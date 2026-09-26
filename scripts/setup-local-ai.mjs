import {existsSync,createWriteStream,createReadStream} from 'node:fs';
import {mkdir,rename,stat,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pipeline} from 'node:stream/promises';
import {Readable} from 'node:stream';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
export async function setupLocalAI(){
 if(process.platform!=='win32')throw new Error('The included model runtime is for Windows x64. Install llama.cpp for your OS and point LOCAL_LLM_URL to its loopback server.');
 const root=path.resolve('.local-ai');await mkdir(root,{recursive:true});
 const runtimeURL='https://github.com/ggml-org/llama.cpp/releases/download/b11192/llama-b11192-bin-win-cpu-x64.zip';
 const modelURL='https://huggingface.co/Qwen/Qwen3-0.6B-GGUF/resolve/23749fefcc72300e3a2ad315e1317431b06b590a/Qwen3-0.6B-Q8_0.gguf';
 async function download(url,name){const file=path.join(root,name);if(existsSync(file))return file;console.log(`Downloading ${name}...`);const r=await fetch(url);if(!r.ok||!r.body)throw new Error(`Download failed (${r.status})`);await pipeline(Readable.fromWeb(r.body),createWriteStream(file+'.download'));await rename(file+'.download',file);return file;}
 const model=path.join(root,'Qwen3-0.6B-Q8_0.gguf');
 if(!existsSync(model))await download(modelURL,'Qwen3-0.6B-Q8_0.gguf');
 if((await stat(model)).size!==639446688)throw new Error('The model download is incomplete. Remove only the incomplete model file and retry.');
 const executable=path.join(root,'runtime','llama-server.exe');
 if(!existsSync(executable)){
  const zip=await download(runtimeURL,'runtime.zip');const hash=createHash('sha256');for await(const chunk of createReadStream(zip))hash.update(chunk);
  if(hash.digest('hex')!=='9fbfa80da0dd0ecdc00fd1a625db4eb0f85e736ee8157b3ebfe2f37d32a16ddd')throw new Error('Runtime checksum mismatch. Download was not used.');
  const extracted=spawnSync('powershell.exe',['-NoProfile','-Command','Expand-Archive -LiteralPath $env:MG_RUNTIME_ZIP -DestinationPath $env:MG_RUNTIME_DIR -Force'],{env:{...process.env,MG_RUNTIME_ZIP:zip,MG_RUNTIME_DIR:path.join(root,'runtime')},stdio:'inherit',windowsHide:true});if(extracted.status!==0)throw new Error('Could not extract the runtime.');
 }
 await Promise.all([download('https://huggingface.co/Qwen/Qwen3-0.6B-GGUF/raw/23749fefcc72300e3a2ad315e1317431b06b590a/LICENSE','QWEN-LICENSE.txt'),download('https://raw.githubusercontent.com/ggml-org/llama.cpp/b11192/LICENSE','LLAMA-LICENSE.txt')]);
 await writeFile(path.join(root,'provenance.json'),JSON.stringify({model_url:modelURL,runtime_url:runtimeURL,runtime_sha256:'9fbfa80da0dd0ecdc00fd1a625db4eb0f85e736ee8157b3ebfe2f37d32a16ddd'},null,2));
 return {model,executable};
}

