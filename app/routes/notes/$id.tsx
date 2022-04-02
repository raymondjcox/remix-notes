import { Note } from "@prisma/client";
import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import StarterKit from "@tiptap/starter-kit";
import { debounce } from "lodash";
import { Form, useSubmit, useLoaderData } from "remix";
import type { LoaderFunction } from "remix";
import { db } from "~/utils/db.server";
import { useMemo, useEffect, useRef } from "react";
import { findCurrentUser, requireUserSession } from "~/auth";

export let loader: LoaderFunction = async ({ request, params }) => {
  return requireUserSession(request, async (session) => {
    const currentUser = await findCurrentUser(session);

    if (!params.id) {
      throw "No id";
    }

    const note = await db.note.findFirst({
      where: {
        id: +params.id,
        authorId: +currentUser.id,
      },
    });

    return note;
  });
};

export async function action({ request }: { request: Request }) {
  return requireUserSession(request, async (session) => {
    const currentUser = await findCurrentUser(session);
    const formData = await request.formData();
    const noteId = formData.get("noteId");
    const content = formData.get("content") ?? "";
    const title = formData.get("title");

    if (!noteId) {
      return null;
    }

    await db.note.updateMany({
      where: {
        id: +noteId,
        authorId: +currentUser?.id,
      },
      data: {
        title: String(title),
        content: String(content),
      },
    });
    return null;
  });
}

const CustomDocument = Document.extend({
  content: "heading block*",
});

export default function Index() {
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement | null>(null);
  const note = useLoaderData<Note | null>();

  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          "prose prose-slate dark:prose-invert prose-sm selection:bg-emerald-300 selection:text-emerald-900 h-full p-2 resize-none outline-none",
      },
    },
    extensions: [
      CustomDocument,
      StarterKit.configure({
        document: false,
      }),
    ],
    content: note?.content ?? "",
    onUpdate: () => {
      debouncedHandleChange(formRef.current);
    },
  });

  useEffect(() => {
    formRef.current?.reset();
    editor
      ?.chain()
      ?.focus()
      ?.setContent(note?.content ?? "")
      .run();
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
      className="flex flex-col h-full overflow-auto"
      onChange={(e) => debouncedHandleChange(e.currentTarget)}
    >
      <input type="hidden" name="noteId" value={note.id} />
      <input
        type="hidden"
        name="title"
        value={editor?.getText()?.split("\n")?.[0] ?? "No title"}
      />
      <input type="hidden" name="content" value={editor?.getHTML() ?? ""} />
      <EditorContent editor={editor} />
    </Form>
  );
}
