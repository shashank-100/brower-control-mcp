import { WebSocketServer } from "ws";
import { killProcessOnPort, waitForPort } from "./utils/port.js";

export const DEFAULT_WS_PORT = 9003;

export async function createWsServer(port: number = DEFAULT_WS_PORT): Promise<WebSocketServer> {
  await killProcessOnPort(port);
  await waitForPort(port);

  const wss = new WebSocketServer({ port });

  return wss;
}
