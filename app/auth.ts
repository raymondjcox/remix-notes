import { OAuth2Client } from "google-auth-library";
const CLIENT_ID =
  "619781818658-saf14vdg9e70nn652ueisfdqe08n531a.apps.googleusercontent.com";

export async function authenticate(idToken: string) {
  const client = new OAuth2Client(CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload?.["email"];
}
