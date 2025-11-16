import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function killProcessOnPort(port: number): Promise<void> {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    const pids = stdout.trim().split("\n").filter(Boolean);

    for (const pid of pids) {
      try {
        await execAsync(`kill -9 ${pid}`);
      } catch (error) {
        // Process might already be dead, ignore
      }
    }
  } catch (error) {
    // No process on port, that's fine
  }
}

export async function waitForPort(port: number, maxWaitMs = 5000): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      if (!stdout.trim()) {
        return; // Port is free
      }
    } catch (error) {
      return; // Port is free (lsof returns error when no process found)
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  throw new Error(`Port ${port} did not become available within ${maxWaitMs}ms`);
}
