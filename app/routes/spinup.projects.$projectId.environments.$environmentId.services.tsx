import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { getServices, deployServiceInstance } from "~/models/railway.server";
import { requireUserId } from "~/session.server";

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
      {services.map(({ serviceName, id, serviceId }, i) => (
        <NavLink className="lr-list-item" to={`${serviceId}/deployments`}>
          Name: {serviceName} ID: {serviceId}
        </NavLink>
      ))}
      <Outlet />
    </div>
  );
}

