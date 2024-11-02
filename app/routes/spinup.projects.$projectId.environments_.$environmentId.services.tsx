import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
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
  return json({ status });
};

export default function EnvironmentPicker() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Time to spin up a container!</h1>
      <p>Now, pick a service:</p>
      {data.services.map(({ serviceName, id, serviceId }, i) => (
        <div key={i}>
          <Link to={`${id}`}>
            Name: {serviceName} ID: {serviceId}
          </Link>
          <Form method="post">
            <input
              type="hidden"
              id="serviceId"
              name="serviceId"
              value={serviceId}
            />
            <button
              type="submit"
              className="btn-primary"
            >
              Deploy
            </button>
          </Form>
        </div>
      ))}
    </div>
  );
}
