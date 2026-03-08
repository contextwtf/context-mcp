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
}
