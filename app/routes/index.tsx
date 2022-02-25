import { Note } from "@prisma/client";
import { Link, Form, useLoaderData, redirect, Outlet } from "remix";
import type { LoaderFunction } from "remix";

export const action: ActionFunction = async () => {
  return redirect("/notes");
};

export default function Index() {
  return <Link to="/notes">Read notes</Link>;
}
