import { Note } from "@prisma/client";
import { NavLink, Form, useLoaderData, redirect } from "remix";
import type { LoaderFunction } from "remix";
import { prisma } from "../db";

export let loader: LoaderFunction = async ({ params }) => {
  return prisma.note.findMany();
};

export async function action({ request }) {
  await prisma.note.create({
    data: {
      title: "new note",
      content: "",
    },
  });

  //const body = await request.formData();
  //const project = await createProject(body);
  redirect(`/`);
  return null;
}

export default function Index() {
  const notes = useLoaderData<Note[]>();

  return (
    <div className="p-4">
      <h1 className="text-lg">Notes</h1>
      <Form replace method="post">
        <button
          type="submit"
          action="/"
          className="bg-cyan-500 text-white px-2 rounded text-sm">
          New
        </button>
      </Form>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <NavLink to="/support">{note.title}</NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
