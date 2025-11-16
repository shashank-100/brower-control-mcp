import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import type { Context } from "../context.js";
import { captureAriaSnapshot } from "../utils/snapshot.js";
import type { Tool } from "./tool.js";

const snapshotArgsSchema = z.object({});

export const snapshot: Tool = {
  schema: {
    name: "snapshot",
    description: "Capture the current page state using ARIA snapshot",
    inputSchema: zodToJsonSchema(snapshotArgsSchema) as any,
  },
  handle: async (context: Context) => {
    const ariaSnapshot = await captureAriaSnapshot(context);

    return {
      content: [
        {
          type: "text",
          text: ariaSnapshot,
        },
      ],
    };
  },
};

const clickArgsSchema = z.object({
  selector: z.string().describe("CSS selector or ARIA label of the element to click"),
});

export const click: Tool = {
  schema: {
    name: "click",
    description: "Click an element on the page",
    inputSchema: zodToJsonSchema(clickArgsSchema) as any,
  },
  handle: async (context: Context, args: z.infer<typeof clickArgsSchema>) => {
    const validArgs = clickArgsSchema.parse(args);
    await context.sendSocketMessage({
      type: "browser_click",
      selector: validArgs.selector,
    });

    const ariaSnapshot = await captureAriaSnapshot(context);

    return {
      content: [
        {
          type: "text",
          text: ariaSnapshot,
        },
      ],
    };
  },
};

const dragArgsSchema = z.object({
  fromSelector: z.string().describe("CSS selector or ARIA label of the element to drag from"),
  toSelector: z.string().describe("CSS selector or ARIA label of the element to drag to"),
});

export const drag: Tool = {
  schema: {
    name: "drag",
    description: "Drag an element to another element",
    inputSchema: zodToJsonSchema(dragArgsSchema) as any,
  },
  handle: async (context: Context, args: z.infer<typeof dragArgsSchema>) => {
    const validArgs = dragArgsSchema.parse(args);
    await context.sendSocketMessage({
      type: "browser_drag",
      fromSelector: validArgs.fromSelector,
      toSelector: validArgs.toSelector,
    });

    const ariaSnapshot = await captureAriaSnapshot(context);

    return {
      content: [
        {
          type: "text",
          text: ariaSnapshot,
        },
      ],
    };
  },
};

const hoverArgsSchema = z.object({
  selector: z.string().describe("CSS selector or ARIA label of the element to hover over"),
});

export const hover: Tool = {
  schema: {
    name: "hover",
    description: "Hover over an element on the page",
    inputSchema: zodToJsonSchema(hoverArgsSchema) as any,
  },
  handle: async (context: Context, args: z.infer<typeof hoverArgsSchema>) => {
    const validArgs = hoverArgsSchema.parse(args);
    await context.sendSocketMessage({
      type: "browser_hover",
      selector: validArgs.selector,
    });

    const ariaSnapshot = await captureAriaSnapshot(context);

    return {
      content: [
        {
          type: "text",
          text: ariaSnapshot,
        },
      ],
    };
  },
};

const typeArgsSchema = z.object({
  selector: z.string().describe("CSS selector or ARIA label of the input element"),
  text: z.string().describe("Text to type into the element"),
});

export const type: Tool = {
  schema: {
    name: "type",
    description: "Type text into an input element",
    inputSchema: zodToJsonSchema(typeArgsSchema) as any,
  },
  handle: async (context: Context, args: z.infer<typeof typeArgsSchema>) => {
    const validArgs = typeArgsSchema.parse(args);
    await context.sendSocketMessage({
      type: "browser_type",
      selector: validArgs.selector,
      text: validArgs.text,
    });

    const ariaSnapshot = await captureAriaSnapshot(context);

    return {
      content: [
        {
          type: "text",
          text: ariaSnapshot,
        },
      ],
    };
  },
};

const selectOptionArgsSchema = z.object({
  selector: z.string().describe("CSS selector or ARIA label of the select element"),
  value: z.string().describe("Value of the option to select"),
});

export const selectOption: Tool = {
  schema: {
    name: "selectOption",
    description: "Select an option in a dropdown/select element",
    inputSchema: zodToJsonSchema(selectOptionArgsSchema) as any,
  },
  handle: async (context: Context, args: z.infer<typeof selectOptionArgsSchema>) => {
    const validArgs = selectOptionArgsSchema.parse(args);
    await context.sendSocketMessage({
      type: "browser_select_option",
      selector: validArgs.selector,
      value: validArgs.value,
    });

    const ariaSnapshot = await captureAriaSnapshot(context);

    return {
      content: [
        {
          type: "text",
          text: ariaSnapshot,
        },
      ],
    };
  },
};
