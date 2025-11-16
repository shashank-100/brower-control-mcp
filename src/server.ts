import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  CallToolResult,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Context } from "./context.js";
import type { Resource } from "./resources/resource.js";
import type { Tool } from "./tools/tool.js";
import { createWsServer } from "./ws.js";

export async function createServerWithTools(
  name: string,
  version: string,
  tools: Tool[],
  resources: Resource[] = []
): Promise<{ server: Server; close: () => Promise<void> }> {
  const server = new Server(
    {
      name,
      version,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Create WebSocket server for browser extension connection
  const wss = await createWsServer();
  const context = new Context();

  // Handle WebSocket connections from browser extension
  wss.on("connection", (ws) => {
    console.error("Browser extension connected");
    context.ws = ws;

    ws.on("close", () => {
      console.error("Browser extension disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: tools.map((tool) => tool.schema),
    };
  });

  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: resources.map((resource) => resource.schema),
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const toolName = request.params.name;
    const tool = tools.find((t) => t.schema.name === toolName);

    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    try {
      const result = await tool.handle(context, request.params.arguments ?? {});
      return result as CallToolResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      } as CallToolResult;
    }
  });

  // Handle resource reading
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    const resource = resources.find((r) => r.schema.uri === uri);

    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }

    const results = await resource.read(context, uri);
    return {
      contents: results,
    };
  });

  // Custom close method
  const close = async () => {
    await server.close();
    wss.close();
    context.close();
  };

  return { server, close };
}

export async function runServer(
  server: Server,
  closeHandler: () => Promise<void>
): Promise<void> {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    await closeHandler();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await closeHandler();
    process.exit(0);
  });
}
