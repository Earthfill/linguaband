import { login } from "@/lib/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const ok = await login(password);
  if (!ok) {
    return new Response("Incorrect password", { status: 401 });
  }
  return Response.redirect(new URL("/admin", request.url), 303);
}
