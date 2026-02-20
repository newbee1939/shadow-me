import { Mastra } from "@mastra/core";
import { shadowMeAgent } from "./agents/shadow-me";
import { newsletterWorkflow } from "./workflows/newsletter-workflow";

export const mastra = new Mastra({
  agents: { shadowMeAgent },
  workflows: { newsletterWorkflow },
});
