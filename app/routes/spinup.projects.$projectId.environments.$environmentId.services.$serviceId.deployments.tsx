import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getDeployment } from "~/models/railway.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const { serviceId, environmentId, projectId } = params;
  const { deployment } = await getDeployment({
    serviceId,
    projectId,
    environmentId,
    userId,
  });
  return json({ deployment });
};

export default function Deployments() {
  const { deployment } = useLoaderData<typeof loader>();
  return (
    <>
    <p>Deployment ID : {deployment.id}</p>
      <p>Deployment Status: {deployment.status}</p>
    </>
  );
}
