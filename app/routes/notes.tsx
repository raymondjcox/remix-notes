import { Note } from "@prisma/client";
import { NavLink, Form, useLoaderData, redirect, Outlet } from "remix";
import type { LoaderFunction } from "remix";
import { prisma } from "../db";

export let loader: LoaderFunction = async ({ params }) => {
  return prisma.note.findMany();
};

export async function action({ request }) {
  await prisma.note.create({
    data: {
      title: "new note",
      content: "Hello world!",
    },
  });

  //const body = await request.formData();
  //const project = await createProject(body);
  redirect(`/notes`);
  return null;
}

export default function Index() {
  const notes = useLoaderData<Note[]>();

  return (
    <div className="p-4 flex bg-slate-800 text-slate-300">
      <div className="flex-none w-24 mr-20">
        <Form replace method="post">
          <button
            type="submit"
            action="/notes?index"
            className="bg-slate-500 text-white px-2 rounded text-sm">
            New
          </button>
        </Form>
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <NavLink to={`/notes/${note.id}`}>
                <div className="flex items-center justify-items-center h-16">
                  {note.title}
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
