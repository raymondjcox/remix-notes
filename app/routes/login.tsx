import { useEffect, useRef, useState } from "react";
import { Form, useSubmit, redirect, json, useLoaderData } from "remix";
import GoogleSignInButton from "~/components/GoogleSignInButton";
import { commitSession, createUserSession, getSession } from "~/sessions";
import { authenticate, findOrCreateUser } from "~/auth";

export async function loader({ request }) {
  const session = await getSession(request);

  if (session.has("userId")) {
    return redirect("/notes");
  }

  const data = { error: session.get("error") };

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function action({ request }) {
  const session = await getSession(request);

  const formData = await request.formData();

  try {
    const userId = await authenticate(formData.get("id"));
    if (!userId) {
      throw "Empty payload";
    }

    if (!userId.email) {
      throw "No user email";
    }

    const user = await findOrCreateUser({
      firstName: userId.given_name ?? "",
      lastName: userId.family_name ?? "",
      email: userId.email,
    });
    return await createUserSession(`${user.id}`, "/notes");
  } catch (err) {
    session.flash("error", "Unable to login");
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}

export default function Login() {
  const submit = useSubmit();
  const { error } = useLoaderData();

  const ref = useRef<HTMLFormElement | null>(null);
  const [id, setId] = useState("");

  useEffect(() => {
    if (id && ref.current) {
      submit(ref.current, { replace: true });
    }
  }, [id]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Form
        ref={ref}
        className="flex flex-col items-center py-4 px-12 border gap-2"
        method="post"
      >
        <h1 className="text-lg">Log in to Notes</h1>
        <input name="id" type="hidden" value={id} />
        <GoogleSignInButton signedIn={({ credential }) => setId(credential)} />
        <div className="text-xs text-red-500">{error}</div>
      </Form>
    </div>
  );
}
