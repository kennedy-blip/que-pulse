export type JobStatus = 'pending' | 'active' | 'completed' | 'failed' | 'dlq'
export type Priority = 'low' | 'normal' | 'high' | 'critical'
export interface Job {
  id: string; name: string; queue: string; status: JobStatus; priority: Priority
  payload: Record<string, unknown>; attempts: number; maxRetries: number
  createdAt: string; updatedAt: string; startedAt?: string; completedAt?: string
  durationMs?: number; error?: string; logs: string[]; backoffMs?: number
}
export interface QueueSnapshot {
  jobs: Job[]; stats: { pending: number; active: number; completed: number; failed: number; dlq: number; throughput: number; total: number }
  config: { concurrency: number; errorRate: number; workerCount: number }
  updatedAt: string
}
