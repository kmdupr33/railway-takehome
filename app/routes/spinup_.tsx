import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { getProjectListItems } from "~/models/railway.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const projectListItems = await getProjectListItems({ userId });
  return json({ projectListItems: projectListItems });
};

export default function SpinupWizard() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <h1 className="text-3xl font-medium">Time to spin up a container!</h1>
      <p>First, pick a project:</p>
      <hr />
      <div className="py-4">
        {data.projectListItems.map(({ name, id }, i) => (
          <Link key={i} to={`projects/${id}/environments`}>
            Name: {name} ID: {id}
          </Link>
        ))}
      </div>
    </div>
  );
}
