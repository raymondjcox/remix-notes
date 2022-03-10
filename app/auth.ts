import { User } from "@prisma/client";
import { db } from "~/utils/db.server";
import { OAuth2Client } from "google-auth-library";
import config from "~/config";
import { getSession, destroySession } from "./sessions";

export async function authenticate(idToken: string) {
  const client = new OAuth2Client(config.CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  console.log(payload);
  return payload;
}

export async function unauthorized(request: Request) {
  const session = await getSession(request);
  return !session.has("userId");
}

export async function findCurrentUser(request: Request) {
  const session = await getSession(request);
  return db.user.findFirst({
    where: {
      id: +session.get("userId"),
    },
  });
}

export function findUserByEmail(email: string) {
  return db.user.findFirst({
    where: {
      email,
    },
  });
}

type PartialUser = Pick<User, "email" | "firstName" | "lastName">;

export function createUser(user: PartialUser) {
  return db.user.create({
    data: {
      ...user,
    },
  });
}

export async function findOrCreateUser(user: PartialUser): Promise<User> {
  const { email } = user;
  const maybeUser = await findUserByEmail(email);
  return maybeUser ? maybeUser : createUser(user);
}
