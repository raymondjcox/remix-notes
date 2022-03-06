import { Note } from "@prisma/client";
import {
  NavLink,
  Form,
  useLoaderData,
  redirect,
  Outlet,
  useParams,
} from "remix";
import { DocumentAddIcon, TrashIcon, SunIcon } from "@heroicons/react/outline";
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
    const newNote = await db.note.create({
      data: {
        title: "Empty note",
        content: "",
      },
    });
    return redirect(`/notes/${newNote.id}`);
  }

  if (formData.get("_action") === "delete" && noteId) {
    await db.note.delete({
      where: {
        id: +noteId,
      },
    });
  }

  return redirect(`/notes`);
}

function HeaderMenu() {
  const { id: noteId } = useParams();
  return (
    <div className="bg-slate-700 text-slate-400 flex align-items justify-between pt-2 pb-2 px-8 gap-4">
      <Form className="flex align-items gap-4" method="post">
        <input type="hidden" name="noteId" value={noteId ?? 0} />
        <button type="submit" name="_action" value="create">
          <DocumentAddIcon className="h-5 w-5 cursor-pointer pointer-events-none" />
        </button>
        {noteId && (
          <button type="submit" name="_action" value="delete">
            <TrashIcon className="h-5 w-5 cursor-pointer pointer-events-none" />
          </button>
        )}
      </Form>
      <SunIcon className="h-5 w-5 cursor-pointer pointer-events-none" />
    </div>
  );
}

export default function Index() {
  const notes = useLoaderData<Pick<Note, "id" | "title">[]>();

  return (
    <div className="text-slate-50 h-screen flex flex-col">
      <HeaderMenu />
      <div className="bg-slate-800 flex h-full min-h-0">
        <div className="flex-initial basis-3/12 overflow-auto h-full">
          <ul className="overflow-auto divide-y divide-slate-600 mx-3 mt-3">
            {notes.map((note) => (
              <li key={note.id}>
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "block rounded px-6 bg-yellow-500/[.75] transition-colors"
                      : "rounded block px-6 transition-colors"
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
