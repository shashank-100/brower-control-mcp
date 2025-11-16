import { WebSocket } from "ws";

export class Context {
  private _ws: WebSocket | null = null;

  get ws(): WebSocket {
    if (!this._ws) {
      throw new Error(
        "No connection to browser extension. Please connect by clicking the extension icon in your browser toolbar."
      );
    }
    return this._ws;
  }

  set ws(ws: WebSocket) {
    this._ws = ws;
  }

  hasWs(): boolean {
    return this._ws !== null;
  }

  async sendSocketMessage<T>(payload: {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }, timeout = 30000): Promise<T> {
    return new Promise((resolve, reject) => {
      const ws = this.ws;
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`Socket message timeout after ${timeout}ms`));
      }, timeout);

      const messageHandler = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.type === `${payload.type}_response`) {
            cleanup();
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.data as T);
            }
          }
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      const errorHandler = (error: Error) => {
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        clearTimeout(timeoutId);
        ws.off("message", messageHandler);
        ws.off("error", errorHandler);
      };

      ws.on("message", messageHandler);
      ws.on("error", errorHandler);

      try {
        ws.send(JSON.stringify(payload));
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }

  close(): void {
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
  }
}
