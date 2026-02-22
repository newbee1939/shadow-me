import { Step, Workflow } from "@mastra/core/workflow";
import { z } from "zod";
import { runKnipTool } from "../tools/knip";

const analyzeCodeStep = new Step({
  id: "analyze_code",
  description: "Run knip to analyze the codebase for unused code",
  execute: async () => {
    const result = await runKnipTool.execute({
      fix: false,
      includeTypes: undefined,
    });

    if (!result.success) {
      throw new Error(`Knip analysis failed: ${result.error}`);
    }

    return {
      summary: result.summary,
      issues: result.issues,
    };
  },
});

const generateReportStep = new Step({
  id: "generate_report",
  description: "Generate a detailed report from knip results",
  execute: async ({ context }: { context: { machineContext: unknown } }) => {
    const machineContext = context.machineContext as {
      analyze_code: {
        summary: {
          unusedFiles: number;
          unusedDependencies: number;
          unusedExports: number;
          unusedTypes: number;
          total: number;
        };
        issues: {
          files?: string[];
          dependencies?: string[];
          exports?: string[];
          types?: string[];
        };
      };
    };

    const { summary, issues } = machineContext.analyze_code;

    if (summary.total === 0) {
      return {
        hasIssues: false,
        report: "✅ No unused code detected! The codebase is clean.",
      };
    }

    let report = "# Knip Analysis Report\n\n";
    report += `## Summary\n\n`;
    report += `- **Total Issues**: ${summary.total}\n`;
    report += `- **Unused Files**: ${summary.unusedFiles}\n`;
    report += `- **Unused Dependencies**: ${summary.unusedDependencies}\n`;
    report += `- **Unused Exports**: ${summary.unusedExports}\n`;
    report += `- **Unused Types**: ${summary.unusedTypes}\n\n`;

    if (issues.files && issues.files.length > 0) {
      report += `## 📁 Unused Files (${issues.files.length})\n\n`;
      for (const file of issues.files) {
        report += `- ${file}\n`;
      }
      report += "\n";
    }

    if (issues.dependencies && issues.dependencies.length > 0) {
      report += `## 📦 Unused Dependencies (${issues.dependencies.length})\n\n`;
      for (const dep of issues.dependencies) {
        report += `- ${dep}\n`;
      }
      report += "\n";
    }

    if (issues.exports && issues.exports.length > 0) {
      report += `## 📤 Unused Exports (${issues.exports.length})\n\n`;
      for (const exp of issues.exports.slice(0, 20)) {
        report += `- ${exp}\n`;
      }
      if (issues.exports.length > 20) {
        report += `\n... and ${issues.exports.length - 20} more\n\n`;
      }
    }

    if (issues.types && issues.types.length > 0) {
      report += `## 📝 Unused Types (${issues.types.length})\n\n`;
      for (const type of issues.types.slice(0, 20)) {
        report += `- ${type}\n`;
      }
      if (issues.types.length > 20) {
        report += `\n... and ${issues.types.length - 20} more\n\n`;
      }
    }

    report += "\n## 💡 Recommendations\n\n";
    report +=
      "1. Review unused files and remove them if they're no longer needed\n";
    report +=
      "2. Remove unused dependencies to reduce bundle size and security surface\n";
    report +=
      "3. Clean up unused exports to improve code maintainability\n";
    report +=
      "4. Use `npm run knip:fix` to automatically fix some issues (review changes carefully)\n";

    return {
      hasIssues: true,
      report,
      summary,
      issues,
    };
  },
});

export const knipCleanupWorkflow = new Workflow({
  name: "knip-cleanup",
  triggerSchema: z.object({
    autoFix: z
      .boolean()
      .optional()
      .default(false)
      .describe("Automatically fix issues if true"),
  }),
})
  .step(analyzeCodeStep)
  .step(generateReportStep)
  .commit();
