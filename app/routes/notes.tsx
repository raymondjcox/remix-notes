import { Note } from "@prisma/client";
import {
  NavLink,
  Form,
  useLoaderData,
  redirect,
  Outlet,
  useParams,
  useLocation,
} from "remix";
import { DocumentAddIcon, TrashIcon } from "@heroicons/react/solid";
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
  const formData = await request.formData();
  const noteId = formData.get("noteId");

  if (formData.get("_action") === "create") {
    await db.note.create({
      data: {
        title: "Empty note",
        content: "",
      },
    });
  }

  if (formData.get("_action") === "delete" && noteId) {
    await db.note.delete({
      where: {
        id: +noteId,
      },
    });
  }

  redirect(`/notes`);
  return null;
}

function HeaderMenu() {
  const { id: noteId } = useParams();
  return (
    <Form method="post">
      <div className="bg-slate-700 flex align-items pt-2 pb-2 pl-8 gap-4">
        <input type="hidden" name="noteId" value={noteId ?? 0} />
        <button type="submit" name="_action" value="create">
          <DocumentAddIcon className="h-5 w-5 text-blue-300 cursor-pointer pointer-events-none" />
        </button>
        <button
          disabled={!noteId}
          className={!noteId ? "cursor-not-allowed" : ""}
          type="submit"
          name="_action"
          value="delete"
        >
          <TrashIcon
            className={`h-5 w-5 cursor-pointer pointer-events-none ${
              noteId ? "text-red-300" : "text-slate-100"
            }`}
          />
        </button>
      </div>
    </Form>
  );
}

export default function Index() {
  const notes = useLoaderData<Pick<Note, "id" | "title">[]>();

  return (
    <div className="text-slate-300 h-screen flex flex-col">
      <HeaderMenu />
      <div className="bg-slate-800 flex h-full min-h-0">
        <div className="flex-initial basis-3/12 overflow-auto h-full">
          <ul className="pl-8 pr-8 overflow-auto divide-y divide-slate-600">
            {notes.map((note) => (
              <li key={note.id}>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "text-amber-500" : ""
                  }
                  to={`/notes/${note.id}`}
                >
                  <div className="flex items-center justify-items-center font-semibold text-sm h-16">
                    <div className="min-w-0 overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {note.title || "No content"}
                    </div>
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
