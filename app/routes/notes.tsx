import { Note } from "@prisma/client";
import {
  NavLink,
  Form,
  useLoaderData,
  redirect,
  Outlet,
  useParams,
  useTransition,
} from "remix";
import {
  DocumentAddIcon,
  TrashIcon,
  MoonIcon,
  ChevronDownIcon,
  SunIcon,
} from "@heroicons/react/outline";
import type { LoaderFunction } from "remix";
import { db } from "~/utils/db.server";
import { unauthorized } from "~/auth";
import { useColorMode } from "~/theme";

interface ReturnedNote extends Pick<Note, "id" | "title" | "content"> {
  createdAt: string;
  updatedAt?: string;
}

export let loader: LoaderFunction = async ({ request }) => {
  if (await unauthorized(request)) {
    return redirect("/login");
  }

  const notes = await db.note.findMany({
    orderBy: {
      updatedAt: "desc",
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
  if (await unauthorized(request)) {
    return redirect("/login");
  }

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
  const [mode, toggleColorMode] = useColorMode();
  const { id: noteId } = useParams();
  const transition = useTransition();

  return (
    <div className="bg-white dark:bg-slate-900 dark:border-slate-800 border-b flex align-items justify-between pt-2 pb-2 px-8 gap-4">
      <Form className="flex align-items gap-4" method="post">
        <input type="hidden" name="noteId" value={noteId ?? 0} />
        <button
          disabled={!!transition.submission}
          className="group"
          type="submit"
          name="_action"
          value="create"
        >
          <DocumentAddIcon className="h-5 w-5 pointer-events-none group-hover:stroke-green-400" />
        </button>
        {noteId && (
          <button
            disabled={!!transition.submission}
            className="group"
            type="submit"
            name="_action"
            value="delete"
          >
            <TrashIcon className="h-5 w-5 pointer-events-none group-hover:stroke-red-400" />
          </button>
        )}
      </Form>
      <div className="flex items-center gap-4 dark:text-slate-300">
        {mode === "dark" && (
          <MoonIcon
            className="h-5 w-5 stroke-cyan-600 cursor-pointer"
            onClick={toggleColorMode}
          />
        )}

        {mode === "light" && (
          <SunIcon
            className="h-5 w-5 stroke-cyan-600 cursor-pointer"
            onClick={toggleColorMode}
          />
        )}
        <></>
        <div className="flex items-center gap-1 cursor-pointer select-none">
          <div className="text-md">Raymond</div>
          <ChevronDownIcon className="h-4 w-4" />
        </div>
      </div>
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
    <div className="dark:text-slate-400 h-screen flex flex-col">
      <HeaderMenu />
      <div className="dark:text-slate-200 dark:bg-slate-900 flex h-full min-h-0 ">
        <div className="overflow-auto flex-initial basis-3/12 h-full border-r dark:border-slate-800">
          <ul className="overflow-auto mx-3 mt-3 ">
            {notes.map((note) => (
              <li key={note.id}>
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "block rounded px-6 bg-slate-200 dark:bg-slate-700"
                      : "block px-6 "
                  }
                  to={`/notes/${note.id}`}
                >
                  <div className="flex flex-col justify-center justify-items-center  h-16 select-none">
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
