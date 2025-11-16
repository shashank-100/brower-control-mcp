import type { Context } from "../context.js";

export async function captureAriaSnapshot(context: Context): Promise<string> {
  const snapshot = await context.sendSocketMessage<{ snapshot: string }>({
    type: "browser_capture_snapshot",
  });
  return snapshot.snapshot;
}
