import { User } from "@prisma/client";
import { db } from "~/utils/db.server";
import { OAuth2Client } from "google-auth-library";
import config from "~/config";
import { getSession } from "./sessions";
import { Session, redirect } from "remix";

export async function authenticate(idToken: string) {
  const client = new OAuth2Client(config.CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.CLIENT_ID,
  });
  return ticket.getPayload();
}

export async function findCurrentUser(session: Session) {
  const id = session.get("userId");

  const currentUser = await db.user.findFirst({
    where: {
      id: +id,
    },
  });

  if (currentUser === null) {
    throw "Unable to find current user (this should never happen)";
  }

  return currentUser;
}

export async function requireUserSession(
  request: Request,
  next: (session: Session) => any
) {
  const session = await getSession(request);
  const id = session.get("userId");

  if (!id) {
    return redirect("/login");
  } else {
    return next(session);
  }
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
