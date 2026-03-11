import { z } from "zod";
import { getTradingClient } from "../lib/client.js";
import { toolResult, toolError, type Server } from "../lib/utils.js";

export function registerQuestionTools(server: Server) {
  // 1. Create a new prediction market from a question
  server.tool(
    "context_create_market",
    "Create a new prediction market from a natural language question. The AI oracle processes the question and generates a market. This may take 30-90 seconds. Requires CONTEXT_PRIVATE_KEY.",
    {
      question: z
        .string()
        .describe("A natural language question to create a prediction market for"),
    },
    async (params) => {
      try {
        const client = getTradingClient();
        const submission = await client.questions.submitAndWait(params.question);

        if (submission.status === "failed") {
          return toolError(
            "Oracle failed to process the question. Try rephrasing."
          );
        }

        if (!submission.questions?.length) {
          return toolError("Oracle returned no market questions.");
        }

        const generated = submission.questions[0];
        const market = await client.markets.create(generated.id);

        return toolResult({
          message: "Market created successfully!",
          market,
          generatedQuestion: generated,
        });
      } catch (error) {
        return toolError(error);
      }
    }
  );

  // 2. Submit a fully-formed market draft directly
  server.tool(
    "context_agent_submit_market",
    "Submit a fully-formed market draft directly, bypassing AI question generation. Returns a submissionId for tracking. Use this when you have a specific market structure in mind (question, resolution criteria, end time, etc). Requires CONTEXT_PRIVATE_KEY.",
    {
      formattedQuestion: z.string().describe("Full question text for the market"),
      shortQuestion: z.string().describe("Short display title for the market"),
      marketType: z.enum(["SUBJECTIVE", "OBJECTIVE"]).describe("Whether resolution is subjective (opinion-based) or objective (verifiable fact)"),
      evidenceMode: z.enum(["social_only", "web_enabled"]).describe("Evidence sources: social_only for social signals, web_enabled for web scraping"),
      resolutionCriteria: z.string().describe("Clear criteria for how this market should resolve"),
      endTime: z.string().describe("Market end time as 'YYYY-MM-DD HH:MM:SS'"),
      timezone: z.string().describe("IANA timezone identifier").default("America/New_York"),
      sources: z.array(z.string()).describe("URLs to monitor for evidence").optional(),
      explanation: z.string().max(120).describe("Brief explanation of the market (max 120 chars)").optional(),
    },
    async (params) => {
      try {
        const client = getTradingClient();
        const result = await client.questions.agentSubmit({
          market: {
            formattedQuestion: params.formattedQuestion,
            shortQuestion: params.shortQuestion,
            marketType: params.marketType,
            evidenceMode: params.evidenceMode,
            resolutionCriteria: params.resolutionCriteria,
            endTime: params.endTime,
            timezone: params.timezone,
            sources: params.sources,
            explanation: params.explanation,
          },
        });
        return toolResult(result);
      } catch (error) {
        return toolError(error);
      }
    }
  );
}
