import { Mastra } from "@mastra/core";
import { shadowMeAgent } from "./agents/shadow-me";
import { newsletterWorkflow } from "./workflows/newsletter-workflow";

export const mastra = new Mastra({
  agents: { shadowMeAgent },
  workflows: { newsletterWorkflow },
});

/**
 * How to execute workflows:
 *
 * 1. Mastra Studio UI (Recommended):
 *    Run `npm run dev` and execute workflows at http://localhost:4111
 *
 * 2. Programmatically:
 *    const run = await mastra.workflows.newsletterWorkflow.createRun();
 *    const result = await run.start({ inputData: {} });
 *    console.log(result.outputData?.newsletter);
 *
 * 3. Via API endpoints:
 *    Use REST API endpoints provided by Mastra
 */
