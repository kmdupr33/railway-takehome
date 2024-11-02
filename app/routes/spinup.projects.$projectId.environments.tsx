import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getEnvironments, getServices } from "~/models/railway.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const environments = await getEnvironments({ id: params.projectId, userId });
  return json({ environments });
};

export default function EnvironmentPicker() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Time to spin up a container!</h1>
      <p>Now, pick an environment:</p>
      {data.environments.map(({ name, id }, i) => (
        <div key={i}>
          <Link to={`${id}/services`}>
            Name: {name} ID: {id}
          </Link>
        </div>
      ))}
    </div>
  );
}