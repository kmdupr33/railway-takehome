import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { createClient } from "graphql-ws";
import { Form, useLoaderData, useParams } from "@remix-run/react";
import { getDeployment, removeDeployment } from "~/models/railway.server";
import { requireUserId } from "~/session.server";
import { useEffect } from "react";

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

const client = createClient({
  url: "wss://backboard.railway.app/graphql/v2",
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const deploymentId = formData.get("deploymentId");
  const res = await removeDeployment({ userId, deploymentId });
  return json(res);
};

export default function Deployments() {
  const { deployment } = useLoaderData<typeof loader>();
  async function subscribe() {
    const subscription = client.iterate<{ deployment: { status: string } }>(
      /* GraphQL */ {
        query: `
      subscription {
        deployment(id: "${deployment.id}") {
          status
        }
      }
    `,
      },
    );
    for await (const { data } of subscription) {
      console.log(data);
      if (
        ["SUCCESS", "FAILED", "CRASHED", "REMOVED", "SLEEPING"].includes(
          data?.deployment.status,
        )
      ) {
        console.log("complete");
        break;
      }
    }
  }
  useEffect(() => {
    subscribe();
  }, [deployment]);
  return (
    <>
      <p>Deployment ID : {deployment.id}</p>
      <p>Deployment Status: {deployment.status}</p>
      {deployment.status !== "REMOVED" && (
        <Form method="post">
          <input type="hidden" name="deploymentId" value={deployment.id} />
          <button
            type="submit"
            className="flex h-[42px] transform items-center justify-center space-x-3 rounded-md border border-red-500 bg-red-500 px-3 py-2 text-base leading-6 text-white transition-transform duration-75 hover:border-red-600 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 active:scale-95"
          >
            Remove
          </button>
        </Form>
      )}
    </>
  );
}
