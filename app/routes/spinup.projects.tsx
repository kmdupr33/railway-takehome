import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { getProjectListItems } from "~/models/railway.server";
import { requireUserId } from "~/session.server";
import { json, LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const projectListItems = await getProjectListItems({ userId });
  return json({ projectListItems });
};
export default function Projects() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <h1 className="text-3xl font-medium">Time to spin up a container!</h1>
      <p>First, pick a project:</p>
      <div>
        {data.projectListItems.map(({ name, id }, i) => (
          <Link className="lr-list-item" key={i} to={`${id}/environments`}>
            Name: {name} ID: {id}
          </Link>
        ))}
      </div>
      <Outlet />
    </>
  );
}
