import type { User, Note } from "@prisma/client";

import { prisma } from "~/db.server";
import { railwayGqlQuery } from "~/utils";

export async function deployServiceInstance({
  userId,
  serviceId,
  environmentId,
}) {
  await railwayGqlQuery(
    userId,
    /* GraphQL */ `
      mutation {
        serviceInstanceDeploy(
          environmentId: "ef02e2b3-17d9-4929-864b-d89387ac1468"
          serviceId: "b56c946f-b7d0-4cd0-9182-e64cd6383648"
        )
      }
    `,
  );
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

export function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title"> & {
  userId: User["id"];
}) {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}
