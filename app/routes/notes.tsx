import { Note, User } from "@prisma/client";
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
import { findCurrentUser, unauthorized } from "~/auth";
import { useColorMode } from "~/theme";
import { useEffect, useState } from "react";
import { getSession, destroySession } from "~/sessions";

interface ReturnedNote extends Pick<Note, "id" | "title" | "content"> {
  createdAt: string;
  updatedAt?: string;
}

interface DataLoaderResponse {
  notes: ReturnedNote[];
  currentUser: User;
}

export let loader: LoaderFunction = async ({ request }) => {
  if (await unauthorized(request)) {
    return redirect("/login");
  }
  const currentUser = await findCurrentUser(request);

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
    where: {
      authorId: currentUser?.id,
    },
  });

  return {
    notes: notes.map((note) => ({
      ...note,
      updatedAt: note?.updatedAt?.toUTCString(),
      createdAt: note.createdAt.toUTCString(),
    })),
    currentUser: currentUser,
  };
};

export async function action({ request }) {
  if (await unauthorized(request)) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const currentUser = await findCurrentUser(request);
  const noteId = formData.get("noteId");

  if (formData.get("_action") === "create" && currentUser) {
    const newNote = await db.note.create({
      data: {
        title: "Empty note",
        content: "",
        authorId: currentUser.id,
      },
    });
    return redirect(`/notes/${newNote.id}`);
  }

  if (formData.get("_action") === "signOut") {
    const session = await getSession(request);
    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
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

  return redirect(`/notes`);
}

function HeaderMenu() {
  const { currentUser } = useLoaderData<DataLoaderResponse>();
  const [mode, toggleColorMode] = useColorMode();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { id: noteId } = useParams();
  const transition = useTransition();

  useEffect(() => {
    const listener = () => {
      setDropdownOpen(false);
    };

    if (dropdownOpen) {
      document.addEventListener("click", listener);
    }

    return () => {
      document.removeEventListener("click", listener);
    };
  }, [dropdownOpen]);

  return (
    <div className="bg-white dark:bg-slate-900 dark:border-slate-800 border-b flex align-items justify-between pt-2 pb-2 px-8 gap-4">
      <Form className="flex align-items gap-4" method="post">
        {noteId && <input type="hidden" name="noteId" value={noteId} />}
        <button
          disabled={!!transition.submission}
          className="group rounded px-1 hover:bg-green-100 dark:hover:bg-green-800"
          type="submit"
          name="_action"
          value="create"
        >
          <DocumentAddIcon className="h-5 w-5 pointer-events-none group-hover:stroke-green-600 dark:group-hover:stroke-green-200" />
        </button>
        {noteId && (
          <button
            disabled={!!transition.submission}
            className="group px-1 hover:bg-red-100 rounded dark:hover:bg-red-800"
            type="submit"
            name="_action"
            value="delete"
          >
            <TrashIcon className="h-5 w-5 pointer-events-none group-hover:stroke-red-600 dark:group-hover:stroke-red-200" />
          </button>
        )}
      </Form>
      <div className="flex items-center gap-4 dark:text-slate-300">
        {mode === "dark" && (
          <MoonIcon
            className="h-7 w-7 px-1 stroke-cyan-600 cursor-pointer rounded dark:hover:bg-cyan-900  dark:hover:stroke-cyan-200"
            onClick={toggleColorMode}
          />
        )}

        {mode === "light" && (
          <SunIcon
            className="h-7 w-7 px-1 stroke-cyan-600 cursor-pointer rounded hover:bg-cyan-100 hover:stroke-cyan-800"
            onClick={toggleColorMode}
          />
        )}
        <></>
        <div className="relative">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800`}
            onClick={() => setDropdownOpen(true)}
          >
            <div className="text-md">{currentUser.firstName}</div>
            <ChevronDownIcon
              className={`h-4 w-4 transition-all ease-in-out ${
                dropdownOpen && "rotate-180"
              }`}
            />
          </div>
          <Form
            method="post"
            className={`transition-opacity ease-in-out absolute cursor-pointer rounded shadow w-full bg-white dark:bg-slate-800 border dark:border-slate-700 left-0 width-100 text-sm ${
              dropdownOpen ? "visible opacity-100" : "invisible opacity-0"
            }`}
          >
            <button
              className="hover:bg-red-100 hover:text-red-900 w-full p-2 rounded dark:hover:bg-red-300 text-left"
              type="submit"
              name="_action"
              value="signOut"
            >
              Sign out
            </button>
          </Form>
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
  const { notes } = useLoaderData<DataLoaderResponse>();

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
