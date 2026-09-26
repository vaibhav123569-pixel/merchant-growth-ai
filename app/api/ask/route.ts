import {env} from 'cloudflare:workers';
import {generateExplanation,llmStatus,type LLMConfig} from '@/lib/llm';
import {explain} from '@/lib/analytics';
import {json,sameOrigin,readJson,throttle} from '@/lib/server';
export async function GET(){return json(llmStatus(env as unknown as LLMConfig));}
export async function POST(request:Request){try{if(!sameOrigin(request))return json({error:'Invalid origin.'},403);const b=await readJson(request) as {question:string,language:string};if(typeof b.question!=='string'||!b.question.trim()||b.question.length>1000)return json({error:'Ask a question between 1 and 1,000 characters.'},400);const config=env as unknown as LLMConfig;if(config.LLM_PROVIDER!=="local"&&llmStatus(config).configured){const ip=request.headers.get('cf-connecting-ip')||'local';if(await throttle('llm:'+ip,20))return json({...explain(b.question,b.language),live:false,reason:'The demo AI request limit was reached. Showing a calculated explanation.'});}return json(await generateExplanation(b.question,b.language,config));}catch{return json({error:'Could not read your question. Please retry.'},400);}}

