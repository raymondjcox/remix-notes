import { Note } from "@prisma/client";
import { NavLink, Form, useLoaderData, redirect } from "remix";
import type { LoaderFunction } from "remix";
import { prisma } from "../../db";

export let loader: LoaderFunction = async ({ params }) => {
  if (!params.id) {
    throw "No id";
  }
  return prisma.note.findFirst({
    where: {
      id: +params.id,
    },
  });
};

export default function Index() {
  const note = useLoaderData();

  return <div className="p-4">{note.content}</div>;
}
