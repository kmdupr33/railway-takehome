import type { User } from "@prisma/client";

import { railwayGqlQuery } from "~/utils";

export async function removeDeployment({
  userId,
  deploymentId,
}: {
  userId: string;
  deploymentId: string;
}) {
  const res = await railwayGqlQuery(
    userId,
    /* GraphQL */ `
      mutation {
        deploymentRemove(id: "${deploymentId}")
      }
    `,
  );
  const { data } = await res.json();
  return { deployRemove: data.deploymentRemove };
}

interface DeploymentNode {
  node: {
    id: string;
    updatedAt: string;
    status: string;
  };
}
export async function getDeployments({
  userId,
  serviceId,
  projectId,
  environmentId,
}: {
  userId: string;
  serviceId: string;
  projectId: string;
  environmentId: string;
}): Promise<{ deployments: DeploymentNode["node"][] }> {
  const res = await railwayGqlQuery(
    userId,
    /* GraphQL */ `
        first: 5, 
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
  return {
    deployments: data.deployments.edges.map(({ node }: DeploymentNode) => node),
  };
}

export async function deployServiceInstance({
  userId,
  serviceId,
  environmentId,
}: {
  userId: string;
  serviceId: string;
  environmentId: string;
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
  const { data, errors } = await res.json();
  console.log(errors);
  return { serviceInstanceDeploy: data.serviceInstanceDeploy };
}

interface ServiceInstanceNode {
  node: { id: string; serviceName: string; serviceId: string };
}
export async function getServices({
  id,
  userId,
}: {
  id: string;
  userId: string;
}): Promise<ServiceInstanceNode["node"][]> {
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
  return data.environment.serviceInstances.edges.map(
    ({ node }: ServiceInstanceNode) => node,
  );
}

interface EnvironmentNode {
  node: {
    name: string;
    id: string;
  };
}
export async function getEnvironments({
  id,
  userId,
}: {
  id: string;
  userId: string;
}): Promise<EnvironmentNode["node"][]> {
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
  return data.environments.edges.map(({ node }: EnvironmentNode) => node);
}

interface Project {
  id: string;
  name: string;
}
interface ProjectNode {
  node: Project;
}
export async function getProjectListItems({
  userId,
}: {
  userId: User["id"];
}): Promise<{
  error: string | null;
  projects: Project[] | null;
}> {
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
  if (json.errors?.[0].message === "Not Authorized") {
    return { error: "Not authorized", projects: null };
  }
  return {
    error: null,
    projects: json.data.me.projects.edges.map(({ node }: ProjectNode) => node),
  };
}
