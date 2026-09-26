import ts from 'typescript';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const output='.sites-runtime/llm-tests';
await mkdir(output,{recursive:true});
for(const [input,name] of [['lib/analytics.ts','analytics'],['lib/llm.ts','llm'],['tests/llm_test.ts','test']]){
 const source=(await readFile(input,'utf8')).replace(/(['"])(?:\.\/analytics|\.\.\/lib\/analytics)\1/g,'"./analytics.mjs"').replace(/(['"])\.\.\/lib\/llm\1/g,'"./llm.mjs"');
 await writeFile(`${output}/${name}.mjs`,ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
}
await import('../.sites-runtime/llm-tests/test.mjs');
