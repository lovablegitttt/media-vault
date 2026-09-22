import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/upload", "routes/api.upload.ts"),
  route("api/media", "routes/api.media.ts"),
  route("api/media/*key", "routes/api.media.$key.ts"),
] satisfies RouteConfig;
