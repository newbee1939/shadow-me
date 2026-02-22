import { startScheduler } from "./index";

console.log("Starting shadow-me scheduler...");
const scheduler = startScheduler();

process.on("SIGINT", () => {
  console.log("\nShutting down scheduler...");
  scheduler.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down scheduler...");
  scheduler.stop();
  process.exit(0);
});

console.log("Scheduler is running. Press Ctrl+C to stop.");
