import {evidence} from '@/lib/analytics';
import {json} from '@/lib/server';
export async function GET(){return json({synthetic:true,...evidence});}
