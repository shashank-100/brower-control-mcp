#!/usr/bin/env node

import { program } from "commander";
import { createServerWithTools, runServer } from "./server.js";
import * as commonTools from "./tools/common.js";
import * as customTools from "./tools/custom.js";
import * as snapshotTools from "./tools/snapshot.js";

// Define whether to capture snapshots after navigation
const SNAPSHOT_ENABLED = true;

async function main() {
  program
    .name("browser-mcp")
    .description("MCP server for browser automation")
    .version("0.1.0")
    .parse(process.argv);

  // Collect all tools
  const tools = [
    // Common tools
    commonTools.navigate(SNAPSHOT_ENABLED),
    commonTools.goBack(SNAPSHOT_ENABLED),
    commonTools.goForward(SNAPSHOT_ENABLED),
    commonTools.wait,
    commonTools.pressKey,

    // Custom tools
    customTools.getConsoleLogs,
    customTools.screenshot,

    // Snapshot tools
    snapshotTools.snapshot,
    snapshotTools.click,
    snapshotTools.drag,
    snapshotTools.hover,
    snapshotTools.type,
    snapshotTools.selectOption,
  ];

  // Create and run server
  const { server, close } = await createServerWithTools(
    "browser-mcp",
    "0.1.0",
    tools,
    []
  );

  // Handle stdin close (for graceful shutdown)
  process.stdin.on("close", async () => {
    console.error("stdin closed, shutting down...");
    await close();
    // Give it 15 seconds to close gracefully
    setTimeout(() => {
      process.exit(0);
    }, 15000);
  });

  console.error("Browser MCP server started");
  console.error("Waiting for browser extension connection on port 9003...");

  await runServer(server, close);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
