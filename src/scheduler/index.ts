import cron from "node-cron";
import { mastra } from "../mastra";

export interface ScheduledJob {
  name: string;
  cronExpression: string;
  workflowId: string;
  enabled: boolean;
}

const defaultJobs: ScheduledJob[] = [
  {
    name: "Newsletter Workflow",
    cronExpression: process.env.NEWSLETTER_CRON || "0 9 * * 1",
    workflowId: "newsletterWorkflow",
    enabled: process.env.ENABLE_NEWSLETTER_CRON === "true",
  },
];

export function startScheduler(jobs: ScheduledJob[] = defaultJobs) {
  const scheduledTasks: cron.ScheduledTask[] = [];

  for (const job of jobs) {
    if (!job.enabled) {
      console.log(`Skipping disabled job: ${job.name}`);
      continue;
    }

    if (!cron.validate(job.cronExpression)) {
      console.error(
        `Invalid cron expression for job ${job.name}: ${job.cronExpression}`,
      );
      continue;
    }

    const task = cron.schedule(job.cronExpression, async () => {
      console.log(`Running scheduled job: ${job.name}`);
      try {
        const workflow = mastra.getWorkflow(job.workflowId);
        await workflow.createRun().start();
        console.log(`Successfully completed job: ${job.name}`);
      } catch (error) {
        console.error(`Error running job ${job.name}:`, error);
      }
    });

    scheduledTasks.push(task);
    console.log(
      `Scheduled job: ${job.name} with cron expression: ${job.cronExpression}`,
    );
  }

  return {
    stop: () => {
      for (const task of scheduledTasks) {
        task.stop();
      }
      console.log("All scheduled jobs stopped");
    },
  };
}
