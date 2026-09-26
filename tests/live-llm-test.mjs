import './run-llm-tests.mjs';
const {generateExplanation}=await import('../.sites-runtime/llm-tests/llm.mjs');
for(const [question,language] of [['Why was my afternoon slow?','en'],['दोपहर में भुगतान कम क्यों थे?','hi']]){
 const start=Date.now();const answer=await generateExplanation(question,language,{LLM_PROVIDER:'local',LOCAL_LLM_URL:'http://127.0.0.1:8081'});
 console.log(JSON.stringify({question,seconds:(Date.now()-start)/1000,...answer}));
 if(!answer.live)process.exitCode=1;
}
