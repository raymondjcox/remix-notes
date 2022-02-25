import { Note } from "@prisma/client";
import { NavLink, Form, useLoaderData, redirect, Outlet } from "remix";
import type { LoaderFunction } from "remix";
import { db } from "~/utils/db.server";

export let loader: LoaderFunction = async ({ params }) => {
  return db.note.findMany({
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      title: true,
      content: false,
    },
  });
};

export async function action({ request }) {
  await db.note.create({
    data: {
      title: "new note",
      content: "Hello world!",
    },
  });

  redirect(`/notes`);
  return null;
}

export default function Index() {
  const notes = useLoaderData<Pick<Note, "id" | "title">[]>();

  return (
    <div className="text-slate-300 h-screen flex flex-col">
      <div className="h-12 bg-slate-700">MENU BAR</div>
      <div className="bg-slate-800 flex h-full min-h-0">
        <div className="flex-initial basis-3/12 overflow-auto h-full">
          <ul className="pl-8 pr-8 overflow-auto divide-y divide-slate-600">
            {notes.map((note) => (
              <li key={note.id} className="">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "text-amber-500" : ""
                  }
                  to={`/notes/${note.id}`}>
                  <div className="flex items-center justify-items-center font-semibold text-sm h-16 ">
                    {note.title || "No content"}
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
    </div>
  );
}

/*
        <Form replace method="post">
          <button
            type="submit"
            action="/notes?index"
            className="bg-slate-900 text-white px-2 rounded text-sm">
            New
          </button>
        </Form>
  */
