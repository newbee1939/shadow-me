import { Mastra } from "@mastra/core";
import { shadowMeAgent } from "./agents/shadow-me";

export const mastra = new Mastra({
  agents: { shadowMeAgent },
});
