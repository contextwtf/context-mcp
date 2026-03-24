import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function validateHexNonce(nonce: string): `0x${string}` {
  if (!/^0x[0-9a-fA-F]+$/.test(nonce)) {
    throw new Error("Invalid nonce format: expected 0x-prefixed hex string");
  }
  return nonce as `0x${string}`;
}

export function toolResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function toolError(error: unknown) {
  let message: string;
  if (error instanceof Error) {
    message = error.message;
    if ("status" in error && typeof (error as any).status === "number") {
      message = `[${(error as any).status}] ${message}`;
    }
  } else {
    message = String(error);
  }
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true as const,
  };
}

export type Server = InstanceType<typeof McpServer>;
