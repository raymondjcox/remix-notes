import { Link, redirect } from "remix";
import { getSession } from "~/sessions";

export async function loader({ request }) {
  const session = await getSession(request);

  if (session.has("userId")) {
    return redirect("/notes");
  } else {
    return redirect("/login");
  }
}

export default function Index() {
  return <Link to="/notes">Read notes</Link>;
}
