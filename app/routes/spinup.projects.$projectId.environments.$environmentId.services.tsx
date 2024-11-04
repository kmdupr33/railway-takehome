import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import PendingNavLink from "~/components/pending-nav-link";
import { getServices } from "~/models/railway.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const { environmentId } = params;
  if (!environmentId) {
    throw new Error("environmentId missing from params");
  }
  const services = await getServices({ id: environmentId, userId });
  return json({ services });
};

export default function EnvironmentPicker() {
  const { services } = useLoaderData<typeof loader>();
  if (services.length === 0) {
    return "No services in this environment! Pick a different one.";
  }
  return (
    <div>
      <p>Finally, pick a service:</p>
      {services.map(({ serviceName, id, serviceId }) => (
        <PendingNavLink
          key={id}
          to={`${serviceId}/deployments`}
        >
          {serviceName}
        </PendingNavLink>
      ))}
      <Outlet />
    </div>
  );
}