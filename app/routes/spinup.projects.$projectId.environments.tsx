import { json, LoaderFunctionArgs } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { getEnvironments } from "~/models/railway.server";
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
        <div key={i}>
          <NavLink className="lr-list-item" to={`${id}/services`}>
            {name}
          </NavLink>
        </div>
      ))}
      <Outlet />
    </div>
  );
}
