import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Deployment } from "~/components/deployment";
import NewDeployment from "~/components/new-deployment";
import {
  deployServiceInstance,
  getDeployments,
  removeDeployment,
} from "~/models/railway.server";
import { requireUserId } from "~/session.server";
import { usePolling } from "~/utils";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const { serviceId, environmentId, projectId } = params;
  const { deployments } = await getDeployments({
    serviceId,
    projectId,
    environmentId,
    userId,
  });
  return json({ deployments });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  switch (request.method) {
    case "POST": {
      const serviceId = params.serviceId;
      const deployStatus = await deployServiceInstance({
        userId,
        serviceId,
        environmentId: params.environmentId,
      });
      return json({ status: deployStatus });
    }
    // We handle two actions on this page because a redirect
    // on a separate route won't preserve scroll position
    case "DELETE": {
      const formData = await request.formData();
      const deploymentId = formData.get("deploymentId");
      const removalStatus = await removeDeployment({ userId, deploymentId });
      return json({ status: removalStatus });
    }
  }
};

export default function Deployments() {
  usePolling();
  const { deployments } = useLoaderData<typeof loader>();
  if (deployments.length === 0) {
    return <NewDeployment />;
  }
  const [currentDeploy, ...historicalDeploys] = deployments;
  return (
    <>
      <div>
        <h1 className="mb-4 text-xs font-medium uppercase">Current Deploy</h1>
        <Deployment
          id={currentDeploy.id}
          status={currentDeploy.status}
          current
        />
      </div>

      <h1 className="mb-4 text-xs font-medium uppercase">History</h1>
      {/* TODO Handle cases where there is an empty history */}
      {historicalDeploys.map(({ id, status }) => (
        <Deployment key={id} id={id} status={status} />
      ))}
    </>
  );
}
