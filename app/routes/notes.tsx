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

interface ReturnedNote extends Pick<Note, "id" | "title" | "content"> {
  createdAt: string;
  updatedAt?: string;
}

export let loader: LoaderFunction = async ({ params }) => {
  const notes = await db.note.findMany({
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      createdAt: true,
      content: false,
    },
  });
  return notes.map((note) => ({
    ...note,
    updatedAt: note?.updatedAt?.toUTCString(),
    createdAt: note.createdAt.toUTCString(),
  }));
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

const DateFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "numeric",
  year: "2-digit",
});

const TimeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "numeric",
});

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() == today.getDate() &&
    date.getMonth() == today.getMonth() &&
    date.getFullYear() == today.getFullYear()
  );
};

const formatDate = (date: string): string => {
  const newDate = new Date(date);
  if (isToday(newDate)) {
    return TimeFormat.format(newDate);
  }
  return DateFormat.format(newDate);
};

export default function Index() {
  const notes = useLoaderData<ReturnedNote[]>();

  return (
    <div className="text-slate-200 h-screen flex flex-col">
      <HeaderMenu />
      <div className="bg-slate-800 flex h-full min-h-0">
        <div className="overflow-auto flex-initial basis-3/12 h-full">
          <ul className="overflow-auto mx-3 mt-3 ">
            {notes.map((note) => (
              <li key={note.id}>
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "block rounded px-6 bg-slate-700 transition-colors"
                      : "block px-6 transition-colors"
                  }
                  to={`/notes/${note.id}`}
                >
                  <div className="flex flex-col justify-center justify-items-center  h-16">
                    <div className="min-w-0 overflow-ellipsis whitespace-nowrap overflow-hidden font-semibold text-sm">
                      {note.title || "No content"}
                    </div>

                    <div className="min-w-0 overflow-ellipsis whitespace-nowrap overflow-hidden text-xs">
                      {formatDate(note.updatedAt ?? note.createdAt)}
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
