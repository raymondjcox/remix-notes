import { useEffect, useRef, useState } from "react";
import { Form, useSubmit, redirect, json, useLoaderData } from "remix";
import GoogleSignInButton from "~/components/GoogleSignInButton";
import { getSession, commitSession } from "~/sessions";
import { authenticate } from "~/auth";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("userId")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
  }

  const data = { error: session.get("error") };

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function action({ request }) {
  const session = await getSession(request.headers.get("Cookie"));

  const formData = await request.formData();

  try {
    const email = await authenticate(formData.get("id"));
    session.set("userId", email);

    return redirect("/notes", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
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
  const { currentUser, error } = useLoaderData();

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
      </Form>
    </div>
  );
}
