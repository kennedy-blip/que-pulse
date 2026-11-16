import type { Job, QueueSnapshot, Priority } from './types'

const now = Date.now()
const demo: Job[] = [
  { id:'job_8f2a91',name:'Send welcome email',queue:'notifications',status:'active',priority:'high',payload:{userId:'usr_2048',template:'welcome-v3'},attempts:1,maxRetries:4,createdAt:new Date(now-18000).toISOString(),updatedAt:new Date(now-4000).toISOString(),startedAt:new Date(now-12000).toISOString(),logs:['Job claimed by worker-02','Rendering template welcome-v3'],durationMs:820 },
  { id:'job_7c1d04',name:'Generate monthly report',queue:'reports',status:'pending',priority:'normal',payload:{accountId:'acc_918',month:'2026-11'},attempts:0,maxRetries:3,createdAt:new Date(now-45000).toISOString(),updatedAt:new Date(now-45000).toISOString(),logs:[] },
  { id:'job_6b9e32',name:'Sync inventory catalog',queue:'integrations',status:'pending',priority:'critical',payload:{source:'shopify',items:1240},attempts:2,maxRetries:5,createdAt:new Date(now-65000).toISOString(),updatedAt:new Date(now-22000).toISOString(),backoffMs:4000,logs:['Retry scheduled after transient timeout'] },
  { id:'job_5a8f10',name:'Resize product images',queue:'media',status:'completed',priority:'normal',payload:{batchId:'batch_77',count:48},attempts:1,maxRetries:3,createdAt:new Date(now-190000).toISOString(),updatedAt:new Date(now-150000).toISOString(),completedAt:new Date(now-150000).toISOString(),durationMs:3840,logs:['Processed 48 image assets','Output uploaded to object storage'] },
  { id:'job_4d2c88',name:'Process payment webhook',queue:'payments',status:'failed',priority:'high',payload:{eventId:'evt_9912',type:'payment.updated'},attempts:2,maxRetries:4,createdAt:new Date(now-270000).toISOString(),updatedAt:new Date(now-210000).toISOString(),durationMs:1200,error:'Upstream gateway returned 502',logs:['Attempt 1 failed: gateway timeout','Attempt 2 failed: upstream 502'] },
  { id:'job_3e7b11',name:'Import legacy contacts',queue:'imports',status:'dlq',priority:'low',payload:{file:'contacts-legacy.csv',rows:8200},attempts:5,maxRetries:5,createdAt:new Date(now-3600000).toISOString(),updatedAt:new Date(now-900000).toISOString(),error:'Invalid email format at row 1842',logs:['Attempt 3 failed: validation error','Attempt 4 failed: validation error','Moved to dead letter queue'] },
  { id:'job_2a6c09',name:'Refresh search index',queue:'search',status:'completed',priority:'low',payload:{index:'products-v2',documents:320},attempts:1,maxRetries:3,createdAt:new Date(now-540000).toISOString(),updatedAt:new Date(now-510000).toISOString(),completedAt:new Date(now-510000).toISOString(),durationMs:2940,logs:['Indexed 320 documents'] },
]
let localJobs = [...demo]
let localConfig = { concurrency: 8, errorRate: 12, workerCount: 4 }
let completedCount = 1284
const counts = (jobs: Job[]) => ({ pending:jobs.filter(j=>j.status==='pending').length,active:jobs.filter(j=>j.status==='active').length,completed:jobs.filter(j=>j.status==='completed').length,failed:jobs.filter(j=>j.status==='failed').length,dlq:jobs.filter(j=>j.status==='dlq').length,throughput:completedCount,total:jobs.length })
export function localSnapshot(): QueueSnapshot { return {jobs:localJobs,stats:counts(localJobs),config:localConfig,updatedAt:new Date().toISOString()} }
export async function getJobs(): Promise<QueueSnapshot> {
  try { const r=await fetch('/api/jobs'); if(!r.ok) throw new Error('API unavailable'); return await r.json() as QueueSnapshot }
  catch { return localSnapshot() }
}
export async function enqueueJob(input:{name:string;queue:string;priority:Priority;payload:Record<string,unknown>;maxRetries:number}):Promise<Job>{
  try { const r=await fetch('/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)}); if(!r.ok) throw new Error('API unavailable'); return await r.json() as Job }
  catch { const j:Job={id:`job_${Math.random().toString(16).slice(2,8)}`,name:input.name,queue:input.queue,status:'pending',priority:input.priority,payload:input.payload,attempts:0,maxRetries:input.maxRetries,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),logs:[]};localJobs=[j,...localJobs];return j }
}
export async function runWorker(config?:{concurrency:number;errorRate:number;workerCount:number}):Promise<{processed:number;failed:number;retried:number;dlq:number}>{
  try { const r=await fetch('/api/worker',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(config??localConfig)});if(!r.ok)throw new Error('API unavailable');return await r.json() }
  catch { if(config)localConfig=config;let processed=0,failed=0,retried=0,dlq=0;const pending=localJobs.filter(j=>j.status==='pending').sort((a,b)=>({critical:0,high:1,normal:2,low:3}[a.priority]-{critical:0,high:1,normal:2,low:3}[b.priority]));for(const j of pending.slice(0,localConfig.concurrency)){j.attempts++;j.updatedAt=new Date().toISOString();if(Math.random()*100<localConfig.errorRate){failed++;j.error='Simulated worker execution failure';j.logs=[...j.logs,`Attempt ${j.attempts} failed: simulated error`];if(j.attempts>=j.maxRetries){j.status='dlq';dlq++}else{j.status='pending';j.backoffMs=Math.min(30000,1000*2**(j.attempts-1));retried++}}else{j.status='completed';j.completedAt=new Date().toISOString();j.durationMs=Math.round(180+Math.random()*1800);j.logs=[...j.logs,'Completed successfully'];processed++;completedCount++}}return{processed,failed,retried,dlq} }
}
export async function replayJob(id:string):Promise<void>{try{const r=await fetch(`/api/jobs?id=${encodeURIComponent(id)}`,{method:'PATCH'});if(!r.ok)throw new Error()}catch{localJobs=localJobs.map(j=>j.id===id?{...j,status:'pending',attempts:0,error:undefined,backoffMs:undefined,updatedAt:new Date().toISOString(),logs:[...j.logs,'Manually replayed from DLQ']}:j)}}
