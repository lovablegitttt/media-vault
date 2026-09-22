import type { Route } from "./+types/api.upload";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const FIREBASE_API_KEY = "AIzaSyB9Iw05ez-LxTJYICIBMcANoZMzer-mOz8";
async function getGoogleUser(request: Request) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: authorization.slice(7).trim() }) });
  if (!response.ok) return null;
  const body = await response.json() as { users?: Array<{ localId?: string; providerUserInfo?: Array<{ providerId?: string }> }> };
  return body.users?.find(user => user.providerUserInfo?.some(provider => provider.providerId === "google.com")) ?? null;
}
function safeName(name: string) { return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 180) || "upload"; }
export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const googleUser = await getGoogleUser(request);
  if (!googleUser) return Response.json({ error: "Sign in with Google before uploading media." }, { status: 401 });
  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose an image or video file." }, { status: 400 });
  if (!/^(image|video)\//.test(file.type)) return Response.json({ error: "Only image and video files are supported." }, { status: 415 });
  if (file.size > MAX_FILE_SIZE) return Response.json({ error: "Files must be 50 MB or smaller." }, { status: 413 });
  const key = `${googleUser.localId ?? "user"}/${crypto.randomUUID()}-${safeName(file.name)}`;
  await context.cloudflare.env.UPLOADS.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { originalName: file.name, owner: googleUser.localId ?? "unknown" } });
  return Response.json({ ok: true, key, name: file.name });
}
