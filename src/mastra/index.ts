import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import {
  DefaultExporter,
  Observability,
  SensitiveDataFilter,
} from "@mastra/observability";
import { shadowMeAgent } from "./agents/shadow-me";
import { newsletterWorkflow } from "./workflows/newsletter-workflow";

export const mastra = new Mastra({
  agents: { shadowMeAgent },
  workflows: { newsletterWorkflow },
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
