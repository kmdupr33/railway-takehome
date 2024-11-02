import type { User } from "@prisma/client";

import { railwayGqlQuery } from "~/utils";

export async function getDeployment({
  userId,
  serviceId,
  projectId,
  environmentId,
}) {
  const res = await railwayGqlQuery(
    userId,
    /* GraphQL */ `
    {
      deployments(
        first: 1
        input: {
          projectId: "${projectId}"
          environmentId: "${environmentId}"
          serviceId: "${serviceId}"
        }
      ) {
        edges {
          node {
            id
            updatedAt
            status
          }
        }
      }
    }
  `,
  );
  const { data } = await res.json();
  return { deployment: data.deployments.edges[0].node };
}

export async function deployServiceInstance({
  userId,
  serviceId,
  environmentId,
}) {
  const res = await railwayGqlQuery(
    userId,
    /* GraphQL */ `
      mutation {
        serviceInstanceDeploy(
          environmentId: "${environmentId}"
          serviceId: "${serviceId}"
        )
      }
    `,
  );
  const { data } = await res.json();
  return { serviceInstanceDeploy: data.serviceInstanceDeploy };
}

export async function getServices({ id, userId }) {
  const res = await railwayGqlQuery(
    userId,
    /* GraphQL */ `
      {
        environment(id: "${id}") {
          serviceInstances {
            edges {
              node {
                id
                serviceName
                serviceId
              }
            }
          }
        }
      }
    `,
  );
  const { data } = await res.json();
  return data.environment.serviceInstances.edges.map(({ node }) => node);
}

export async function getEnvironments({ id, userId }) {
  const res = await railwayGqlQuery(
    userId,
    /* GraphQL */ `
      query {
        environments(projectId: "${id}") {
          edges {
            node {
              name
              id
            }
          }
        }
      }
    `,
  );
  const { data } = await res.json();
  return data.environments.edges.map(({ node }) => node);
}

export async function getProjectListItems({ userId }: { userId: User["id"] }) {
  const res = await railwayGqlQuery(
    userId,
    /* GraphQL */ `
      {
        me {
          projects {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `,
  );
  const json = await res.json();
  return json.data.me.projects.edges.map((n: any) => n.node);
}
