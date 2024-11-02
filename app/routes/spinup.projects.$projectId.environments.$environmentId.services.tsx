import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Outlet, useLoaderData } from "@remix-run/react";
import { getServices, deployServiceInstance } from "~/models/railway.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const services = await getServices({ id: params.environmentId, userId });
  return json({ services });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const serviceId = formData.get("serviceId");
  const status = await deployServiceInstance({
    userId,
    serviceId,
    environmentId: params.environmentId,
  });
  if (!status.serviceInstanceDeploy) {
    return json({ status });
  }
  return redirect(`${serviceId}/deployments`);
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
        <Form method="post" key={i}>
          <input type="hidden" name="serviceId" value={serviceId} />
          <button className="lr-list-item w-full text-left" type="submit">
            Name: {serviceName} ID: {serviceId}
          </button>
        </Form>
      ))}
      <Outlet />
    </div>
  );
}
