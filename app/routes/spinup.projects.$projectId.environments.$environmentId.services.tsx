import { json, LoaderFunctionArgs } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  useLoaderData
} from "@remix-run/react";
import { getServices } from "~/models/railway.server";
import { requireUserId } from "~/session.server";
import { parentOfPollingChildShouldRevalidate } from "~/utils";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const services = await getServices({ id: params.environmentId, userId });
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
        <NavLink
          key={id}
          className="lr-list-item"
          to={`${serviceId}/deployments`}
        >
          {serviceName}
        </NavLink>
      ))}
      <Outlet />
    </div>
  );
}

export const shouldRevalidate = parentOfPollingChildShouldRevalidate;