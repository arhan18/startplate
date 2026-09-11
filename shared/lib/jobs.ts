/**
 * Background Jobs Utility for Cloudflare Workers
 * 
 * This module provides utilities for running background jobs
 * using Cloudflare Workers Cron Triggers.
 * 
 * Free tier: 100,000 invocations/day
 */

export interface JobConfig {
  name: string;
  schedule: string; // Cron expression
  handler: (event: ScheduledEvent, env: Env) => Promise<void>;
}

export interface Env {
  // Add your environment variables here
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
  RESEND_API_KEY?: string;
  DODO_PAYMENTS_API_KEY?: string;
}

/**
 * Create a scheduled handler for Cloudflare Workers
 */
export function createScheduledHandler(jobs: JobConfig[]) {
  return {
    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
      const cron = event.cron;
      
      for (const job of jobs) {
        if (job.schedule === cron) {
          console.log(`Running job: ${job.name}`);
          try {
            await job.handler(event, env);
            console.log(`Job completed: ${job.name}`);
          } catch (error) {
            console.error(`Job failed: ${job.name}`, error);
          }
        }
      }
    },
  };
}

/**
 * Example job configurations
 */
export const exampleJobs: JobConfig[] = [
  {
    name: 'scan-mentions',
    schedule: '*/5 * * * *', // Every 5 minutes
    handler: async (event, env) => {
      // TODO: Implement mention scanning
      console.log('Scanning mentions...');
    },
  },
  {
    name: 'send-weekly-digest',
    schedule: '0 9 * * 1', // Every Monday at 9am
    handler: async (event, env) => {
      // TODO: Implement weekly digest
      console.log('Sending weekly digest...');
    },
  },
  {
    name: 'check-subscriptions',
    schedule: '0 0 * * *', // Every day at midnight
    handler: async (event, env) => {
      // TODO: Implement subscription checks
      console.log('Checking subscriptions...');
    },
  },
  {
    name: 'refresh-cache',
    schedule: '0 * * * *', // Every hour
    handler: async (event, env) => {
      // TODO: Implement cache refresh
      console.log('Refreshing cache...');
    },
  },
];

/**
 * Wrangler.toml configuration for cron triggers
 * 
 * Add this to your wrangler.toml:
 * 
 * ```toml
 * [[triggers]]
 * crons = ["*/5 * * * *", "0 9 * * 1", "0 0 * * *", "0 * * * *"]
 * ```
 */
