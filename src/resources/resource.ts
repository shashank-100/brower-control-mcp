import type { Context } from "../context.js";

export interface ResourceSchema {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ResourceResult {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

export interface Resource {
  schema: ResourceSchema;
  read: (context: Context, uri: string) => Promise<ResourceResult[]>;
}
