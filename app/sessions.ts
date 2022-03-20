import { createCookieSessionStorage, redirect } from "remix";

const storage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    expires: new Date(Date.now() + 60_000 * 60 * 24),
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET ?? ""],
    secure: true,
  },
});

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();

  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export function getSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export const commitSession = storage.commitSession;
export const destroySession = storage.destroySession;
