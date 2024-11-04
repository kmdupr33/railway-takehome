import { json, LoaderFunctionArgs } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useMatches } from "@remix-run/react";

import PendingNavLink from "~/components/pending-nav-link";
import { getEnvironments } from "~/models/railway.server";
import { handle as servicesHandle } from "~/routes/spinup.projects.$projectId.environments.$environmentId.services";
import { requireUserId } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  if (!params.projectId) {
    throw new Error("projectId missing");
  }
  const environments = await getEnvironments({ id: params.projectId, userId });
  return json({ environments });
};

export default function EnvironmentPicker() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <p>Now, pick an environment:</p>
      {data.environments.map(({ name, id }, i) => (
        <PendingNavLink key={i} to={`${id}/services`}>
          {name}
        </PendingNavLink>
      ))}
      <Outlet />
    </div>
  );
}
