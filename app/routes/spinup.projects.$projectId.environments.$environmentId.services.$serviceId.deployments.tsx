import { json, LoaderFunctionArgs } from "@remix-run/node";
import { createClient } from "graphql-ws";
import { useLoaderData, useParams } from "@remix-run/react";
import { getDeployment } from "~/models/railway.server";
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
  url: "wss://backboard.railway.app/graphql",
});

export default function Deployments() {
  const { deployment } = useLoaderData<typeof loader>();
  async function subscribe() {
    console.log("is it happening?!");
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
      if (
        ["SUCCESS", "FAILED", "CRAHSED", "REMOVED", "SLEEPING"].includes(
          data.deployment.status,
        )
      ) {
      }
    }
  }
  useEffect(() => {
    subscribe();
  }, []);
  return (
    <>
    <p>Deployment ID : {deployment.id}</p>
      <p>Deployment Status: {deployment.status}</p>
    </>
  );
}
