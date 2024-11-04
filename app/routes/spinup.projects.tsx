import { json, LoaderFunctionArgs } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import PendingNavLink from "~/components/pending-nav-link";

import { getProjectListItems } from "~/models/railway.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const response = await getProjectListItems({ userId });
  return json(response);
};
export default function Projects() {
  const data = useLoaderData<typeof loader>();
  if (data.error) {
    return "Invalid railway token. Please create a new account to try again. Sorry for the jank.";
  }
  // If error is null, projects is non-null
  if (data.projects!.length === 0) {
    return (
      <p>
        You don&apos;t have any projects. Create one{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://railway.app/new"
        >
          here.
        </a>
      </p>
    );
  }
  return (
    <>
      <h1 className="text-3xl font-medium">Time to spin up a container!</h1>
      <p>First, pick a project:</p>
      <div>
        {data.projects!.map(({ name, id }, i) => (
          <PendingNavLink key={i} to={`${id}/environments`}>
            {name}
          </PendingNavLink>
        ))}
      </div>
      <Outlet />
    </>
  );
}
