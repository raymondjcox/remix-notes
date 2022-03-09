import { OAuth2Client } from "google-auth-library";
import config from "~/config";
import { getSession } from "./sessions";

export async function authenticate(idToken: string) {
  const client = new OAuth2Client(config.CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload?.["email"];
}

export async function unauthorized(request: any) {
  const session = await getSession(request);
  return !session.has("userId");
}
