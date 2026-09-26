import {analytics} from '@/lib/analytics';
import {json} from '@/lib/server';
export async function GET(){return json({scenarioDate:'2026-09-26',synthetic:true,...analytics});}
