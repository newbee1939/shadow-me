import { createTool } from "@mastra/core/tools";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";

const execAsync = promisify(exec);

/**
 * Runs knip to detect unused files, dependencies, and exports in the project.
 */
export const runKnipTool = createTool({
  id: "run_knip",
  description:
    "Analyze the project for unused files, dependencies, and exports using knip. Returns a detailed report of dead code.",
  inputSchema: z.object({
    fix: z
      .boolean()
      .optional()
      .default(false)
      .describe("If true, automatically fix issues (use with caution)"),
    includeTypes: z
      .array(z.string())
      .optional()
      .describe(
        "Limit analysis to specific issue types (e.g., ['files', 'dependencies'])",
      ),
  }),
  execute: async ({ fix, includeTypes }) => {
    let command = "npx knip --reporter json";

    if (fix) {
      command += " --fix";
    }

    if (includeTypes && includeTypes.length > 0) {
      command += ` --include ${includeTypes.join(",")}`;
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 10 * 1024 * 1024,
      });

      let result: {
        issues?: Record<string, unknown[]>;
      };
      try {
        result = JSON.parse(stdout);
      } catch {
        return {
          success: false,
          error: "Failed to parse knip output",
          stdout,
          stderr,
        };
      }

      const issues = result.issues || {};
      const summary = {
        unusedFiles: issues.files?.length || 0,
        unusedDependencies: issues.dependencies?.length || 0,
        unusedExports: issues.exports?.length || 0,
        unusedTypes: issues.types?.length || 0,
        total:
          (issues.files?.length || 0) +
          (issues.dependencies?.length || 0) +
          (issues.exports?.length || 0) +
          (issues.types?.length || 0),
      };

      return {
        success: true,
        summary,
        issues,
        fixed: fix,
      };
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === 1) {
        const { stdout } = error as { stdout: string; stderr: string };
        try {
          const result = JSON.parse(stdout);
          const issues = result.issues || {};
          const summary = {
            unusedFiles: issues.files?.length || 0,
            unusedDependencies: issues.dependencies?.length || 0,
            unusedExports: issues.exports?.length || 0,
            unusedTypes: issues.types?.length || 0,
            total:
              (issues.files?.length || 0) +
              (issues.dependencies?.length || 0) +
              (issues.exports?.length || 0) +
              (issues.types?.length || 0),
          };

          return {
            success: true,
            summary,
            issues,
            fixed: fix,
          };
        } catch {
          return {
            success: false,
            error: "Knip found issues but failed to parse output",
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
