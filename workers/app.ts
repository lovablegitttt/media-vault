import { createRequestHandler } from "react-router";
import type { CamelAiBinding } from "./camelai-binding";
import type { ItemStore } from "./item-store";

export { ItemStore } from "./item-store";

interface Env {
  ASSETS?: { fetch(request: Request): Promise<Response> | Response };
  CAMELAI: CamelAiBinding;
  ITEMS: DurableObjectNamespace<ItemStore>;
  UPLOADS: R2Bucket;
  CONNECTIONS: {
    find(query: string | { id?: string; alias?: string; type?: string; name?: string }): Promise<{ error?: unknown; connection?: { authStatus?: string } }>;
  };
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: { env: Env; ctx: ExecutionContext };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

function shouldServeAsset(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") return false;
  const pathname = new URL(request.url).pathname;
  return pathname.startsWith("/assets/") || pathname.includes(".") || pathname === "/robots.txt";
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (env.ASSETS && shouldServeAsset(request)) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) return assetResponse;
    }
    return requestHandler(request, { cloudflare: { env, ctx } });
  },
} satisfies ExportedHandler<Env>;
