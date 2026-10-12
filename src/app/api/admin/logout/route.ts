import { logout } from "@/lib/auth";

export async function POST(request: Request) {
  await logout();
  return Response.redirect(new URL("/admin", request.url), 303);
}
