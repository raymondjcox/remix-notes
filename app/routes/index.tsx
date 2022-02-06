import { Note } from "@prisma/client";
import { useLoaderData } from "remix";
import { PrismaClient } from "@prisma/client";
import type { LoaderFunction } from "remix";
import { prisma } from "../db";

export let loader: LoaderFunction = async ({ params }) => {
  return prisma.note.findMany();
};

export default function Index() {
  const notes = useLoaderData<Note[]>();
  //const notes = [];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>notes</h1>
      <ul>
        {notes.map((note) => {
          <li>
            <a href="#">{note.title}</a>
          </li>;
        })}
      </ul>
    </div>
  );
}
