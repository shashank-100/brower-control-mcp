import { ImageContent, TextContent } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { Context } from "../context.js";

export interface ToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolResult {
  content: Array<ImageContent | TextContent>;
  isError?: boolean;
}

export interface Tool {
  schema: ToolSchema;
  handle: (context: Context, args: any) => Promise<ToolResult>;
}

export type ToolFactory = (snapshot: boolean) => Tool;
