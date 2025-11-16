import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import type { Context } from "../context.js";
import { captureAriaSnapshot } from "../utils/snapshot.js";
import type { Tool, ToolFactory } from "./tool.js";

const navigateArgsSchema = z.object({
  url: z.string().describe("URL to navigate to"),
});

export const navigate: ToolFactory = (snapshot: boolean): Tool => ({
  schema: {
    name: "navigate",
    description: "Navigate to a URL",
    inputSchema: zodToJsonSchema(navigateArgsSchema) as any,
  },
  handle: async (context: Context, args: z.infer<typeof navigateArgsSchema>) => {
    const validArgs = navigateArgsSchema.parse(args);
    await context.sendSocketMessage({
      type: "browser_navigate",
      url: validArgs.url,
    });

    const content = snapshot
      ? await captureAriaSnapshot(context)
      : `Navigated to ${validArgs.url}`;

    return {
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    };
  },
});

const goBackArgsSchema = z.object({});

export const goBack: ToolFactory = (snapshot: boolean): Tool => ({
  schema: {
    name: "goBack",
    description: "Navigate back in browser history",
    inputSchema: zodToJsonSchema(goBackArgsSchema) as any,
  },
  handle: async (context: Context) => {
    await context.sendSocketMessage({
      type: "browser_go_back",
    });

    const content = snapshot
      ? await captureAriaSnapshot(context)
      : "Navigated back";

    return {
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    };
  },
});

const goForwardArgsSchema = z.object({});

export const goForward: ToolFactory = (snapshot: boolean): Tool => ({
  schema: {
    name: "goForward",
    description: "Navigate forward in browser history",
    inputSchema: zodToJsonSchema(goForwardArgsSchema) as any,
  },
  handle: async (context: Context) => {
    await context.sendSocketMessage({
      type: "browser_go_forward",
    });

    const content = snapshot
      ? await captureAriaSnapshot(context)
      : "Navigated forward";

    return {
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    };
  },
});

const waitArgsSchema = z.object({
  seconds: z.number().describe("Number of seconds to wait"),
});

export const wait: Tool = {
  schema: {
    name: "wait",
    description: "Wait for a specified number of seconds",
    inputSchema: zodToJsonSchema(waitArgsSchema) as any,
  },
  handle: async (_context: Context, args: z.infer<typeof waitArgsSchema>) => {
    const validArgs = waitArgsSchema.parse(args);
    await new Promise((resolve) => setTimeout(resolve, validArgs.seconds * 1000));

    return {
      content: [
        {
          type: "text",
          text: `Waited for ${validArgs.seconds} seconds`,
        },
      ],
    };
  },
};

const pressKeyArgsSchema = z.object({
  key: z.string().describe("Key to press (e.g., 'Enter', 'Escape', 'ArrowDown')"),
});

export const pressKey: Tool = {
  schema: {
    name: "pressKey",
    description: "Press a keyboard key",
    inputSchema: zodToJsonSchema(pressKeyArgsSchema) as any,
  },
  handle: async (context: Context, args: z.infer<typeof pressKeyArgsSchema>) => {
    const validArgs = pressKeyArgsSchema.parse(args);
    await context.sendSocketMessage({
      type: "browser_press_key",
      key: validArgs.key,
    });

    return {
      content: [
        {
          type: "text",
          text: `Pressed key: ${validArgs.key}`,
        },
      ],
    };
  },
};
