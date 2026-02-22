import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";
import {
  DefaultExporter,
  Observability,
  SensitiveDataFilter,
} from "@mastra/observability";
import { knipAgent } from "./agents/knip-agent";
import { newsletterAgent } from "./agents/newsletter-agent";
import { shadowMeAgent } from "./agents/shadow-me";
import { knipCleanupWorkflow } from "./workflows/knip-cleanup-workflow";
import { newsletterWorkflow } from "./workflows/newsletter-workflow";

export const mastra = new Mastra({
  agents: { shadowMeAgent, newsletterAgent, knipAgent },
  workflows: { newsletterWorkflow, knipCleanupWorkflow },
  logger: new PinoLogger({ name: "shadow-me", level: "info" }),
  storage: new LibSQLStore({
    id: "mastra-storage",
    url: "file:./mastra.db",
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: "shadow-me",
        exporters: [new DefaultExporter()],
        spanOutputProcessors: [new SensitiveDataFilter()],
      },
    },
  }),
});
