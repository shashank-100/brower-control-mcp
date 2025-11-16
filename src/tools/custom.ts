import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import type { Context } from "../context.js";
import type { Tool } from "./tool.js";

const getConsoleLogsArgsSchema = z.object({});

export const getConsoleLogs: Tool = {
  schema: {
    name: "getConsoleLogs",
    description: "Get browser console logs",
    inputSchema: zodToJsonSchema(getConsoleLogsArgsSchema) as any,
  },
  handle: async (context: Context) => {
    const logs = await context.sendSocketMessage<{ logs: Array<{ type: string; message: string; timestamp: number }> }>({
      type: "browser_get_console_logs",
    });

    const formattedLogs = logs.logs.map((log) => JSON.stringify(log)).join("\n");

    return {
      content: [
        {
          type: "text",
          text: formattedLogs || "No console logs",
        },
      ],
    };
  },
};

const screenshotArgsSchema = z.object({});

export const screenshot: Tool = {
  schema: {
    name: "screenshot",
    description: "Take a screenshot of the current page",
    inputSchema: zodToJsonSchema(screenshotArgsSchema) as any,
  },
  handle: async (context: Context) => {
    const result = await context.sendSocketMessage<{ image: string }>({
      type: "browser_screenshot",
    });

    return {
      content: [
        {
          type: "image",
          data: result.image,
          mimeType: "image/png",
        },
      ],
    };
  },
};
