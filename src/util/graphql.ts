/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { Org, Project } from "../util/types.js";
import { getSlugFromName } from "./index.js";
import chalk from "chalk";

export async function sendGraphQLReqToHypermode(jwt: string, query: string): Promise<any> {
  const url = "https://api.hypermode.com/graphql";

  const options = {
    body: JSON.stringify({ query }),
    headers: {
      Authorization: `${jwt}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        console.error(`Unauthorized. Please try ${chalk.blueBright("hyp login")} again.`);
        throw new Error("Unauthorized: Invalid or expired JWT token.");
      } else {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(`Failed to send GraphQL request: ${error?.message}`);
  }
}

export async function sendMapRepoAndFinishProjectCreationReq(jwt: string, id: string, repoId: string, repoName: string): Promise<Project> {
  const query = `
    mutation MapRepoAndFinishProjectCreation {
      mapRepoAndFinishProjectCreation(input: {id: "${id}", repoName: "${repoName}", repoId: "${repoId}", sourceType: CUSTOM, defaultBranchName: "main"}) {
          id
          name
          repoId
      }
    }`;

  const data: any = await sendGraphQLReqToHypermode(jwt, query);

  const project: Project = data.data.mapRepoAndFinishProjectCreation;

  return project;
}

export async function sendCreateProjectReq(jwt: string, orgId: string, projectName: string, repoId: string, repoName: string): Promise<Project> {
  const slug = getSlugFromName(projectName);
  const query = `
    mutation CreateProjectBranchRuntime {
      createProjectBranchRuntime(input: {orgId: "${orgId}", clusterId: "clu-018f07d5-2446-7dbe-a766-dfab00c726de", name: "${projectName}", slug: "${slug}", repoId: "${repoId}", repoName: "${repoName}", sourceType: CUSTOM, defaultBranchName: "main"}
      ) {
          id
          name
          repoId
      }
    }`;

  const res: any = await sendGraphQLReqToHypermode(jwt, query);

  const project: Project = res.data.createProjectBranchRuntime;

  return project;
}

export async function sendGetOrgsReq(jwt: string): Promise<Org[]> {
  const query = `
      query GetOrgs {
        getOrgs {
            id
            slug
        }
    }`;

  const data: any = await sendGraphQLReqToHypermode(jwt, query);

  const orgs: Org[] = data.data.getOrgs;

  return orgs;
}

export async function getProjectsByOrgReq(jwt: string, orgId: string): Promise<Project[]> {
  const query = `
      query GetProjectsByOrg {
        getOrg(id: "${orgId}") {
            id
            projects {
                id
                name
                repoId
            }
        }
    }`;

  const data: any = await sendGraphQLReqToHypermode(jwt, query);

  const projects: Project[] = data.data.getOrg.projects;

  return projects;
}

export async function sendGetRepoIdReq(jwt: string, installationId: string, gitUrl: string): Promise<string> {
  const query = `
      query getUserRepoIdByUrl {
        getUserRepoIdByUrl(installationId: "${installationId}", gitUrl: "${gitUrl}")
      }`;

  const res: any = await sendGraphQLReqToHypermode(jwt, query);

  if (!res.data.getUserRepoIdByUrl) {
    throw new Error("No repoId found for the given installationId and gitUrl");
  }

  return res.data.getUserRepoIdByUrl;
}
