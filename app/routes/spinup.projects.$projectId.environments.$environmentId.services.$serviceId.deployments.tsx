import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { createClient } from "graphql-ws";
import { Form, useLoaderData } from "@remix-run/react";
import {
  deployServiceInstance,
  getDeployments,
  removeDeployment,
} from "~/models/railway.server";
import { requireUserId } from "~/session.server";
import { useEffect } from "react";

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

const client = createClient({
  url: "wss://backboard.railway.app/graphql/v2",
});

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  switch (request.method) {
    case "POST":
      const serviceId = params.serviceId;
      const deployStatus = await deployServiceInstance({
        userId,
        serviceId,
        environmentId: params.environmentId,
      });
      return json({ status: deployStatus });
    // We handle two actions on this page because a redirect 
    // on a separate route won't preserve scroll position
    case "DELETE":
      const formData = await request.formData();
      const deploymentId = formData.get("deploymentId");
      const removalStatus = await removeDeployment({ userId, deploymentId });
      return json({ status: removalStatus });
  }
};

export default function Deployments() {
  const { deployments } = useLoaderData<typeof loader>();
  async function subscribe() {
    const subscription = client.iterate<{ deployment: { status: string } }>({
      query: /* GraphQL */ `subscription {
          deployment(id: "${deployments[0].id}") {
            status
          }
        }
      `,
    });
    for await (const e of subscription) {
      console.log(e);
      if (
        ["SUCCESS", "FAILED", "CRASHED", "REMOVED", "SLEEPING"].includes(
          // data?.deployment.status,
          "",
        )
      ) {
        console.log("complete");
        break;
      }
    }
  }
  useEffect(() => {
    subscribe();
  }, []);
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
        <Deployment id={id} status={status} />
      ))}
    </>
  );
}

function NewDeployment() {
  return (
    <Form method="post">
      <button className="btn-primary" type="submit">
        Create New Deploy
      </button>
    </Form>
  );
}

function Deployment({ id, status, current = false }) {
  return (
    <div className="lr-list-item">
      <p>DeploymentID: {id}</p>
      <p>Deploymenet Status: {status}</p>
      {current && (
        <div className="mt-2 flex flex-row space-x-4">
          {status !== "REMOVED" && (
            <Form method="delete">
              <input type="hidden" name="deploymentId" value={id} />
              <button
                type="submit"
                className="flex h-[42px] transform items-center justify-center space-x-3 rounded-md border border-red-500 bg-red-500 px-3 py-2 text-base leading-6 text-white transition-transform duration-75 hover:border-red-600 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 active:scale-95"
              >
                Remove
              </button>
            </Form>
          )}
          <NewDeployment />
        </div>
      )}
    </div>
  );
}
