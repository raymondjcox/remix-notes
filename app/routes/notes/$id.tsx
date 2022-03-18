import { Note } from "@prisma/client";
import { debounce } from "lodash";
import { Form, useSubmit, redirect, useLoaderData } from "remix";
import type { LoaderFunction } from "remix";
import { db } from "~/utils/db.server";
import { useMemo, useEffect, useRef } from "react";
import { unauthorized, findCurrentUser } from "~/auth";

export let loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await findCurrentUser(request);

  if (!currentUser) {
    return redirect("/login");
  }

  if (!params.id) {
    throw "No id";
  }

  const note = await db.note.findFirst({
    where: {
      id: +params.id,
      authorId: +currentUser?.id,
    },
  });

  return note;
};

export async function action({ request }) {
  const currentUser = await findCurrentUser(request);

  if (!currentUser) {
    return redirect("/login");
  }

  const formData = await request.formData();

  await db.note.updateMany({
    where: {
      id: +formData.get("noteId"),
      authorId: +currentUser?.id,
    },
    data: {
      title: formData.get("content")?.split("\n")?.[0] ?? "No title",
      content: formData.get("content") ?? "",
    },
  });
  return null;
}

export default function Index() {
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const note = useLoaderData<Note | null>();

  useEffect(() => {
    formRef.current?.reset();
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart =
        textareaRef.current?.defaultValue.length;
      textareaRef.current.selectionEnd =
        textareaRef.current.defaultValue.length;
    }
  }, [note?.id]);

  function handleChange(form: HTMLFormElement) {
    submit(form, { replace: true });
  }

  const debouncedHandleChange = useMemo(
    () => debounce((form: HTMLFormElement) => handleChange(form), 1000),
    []
  );
  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="text-2xl font-bold text-red-500">Note not found</div>
      </div>
    );
  }

  return (
    <Form
      ref={formRef}
      method="post"
      className="flex flex-col h-full"
      onChange={(e) => debouncedHandleChange(e.currentTarget)}
    >
      <input type="hidden" name="noteId" value={note.id} />
      <textarea
        //onFocus={(e) =>
        ref={textareaRef}
        name="content"
        defaultValue={note.content}
        className="selection:bg-emerald-300 selection:text-emerald-900 h-full dark:bg-slate-900 p-2 resize-none outline-none"
        placeholder="enter note here"
      />
    </Form>
  );
}
