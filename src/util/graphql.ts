/* eslint-disable max-params */
import fetch from 'node-fetch'

import {Org, Project} from '../util/types.js'

/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function sendGraphQLReqToHypermode(jwt: string, query: string): Promise<any> {
  const url = 'https://api.hypermode.com/graphql'

  const options = {
    body: JSON.stringify({query}),
    headers: {
      Authorization: `${jwt}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  }

  const response = await fetch(url, options)

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const data: any = await response.json()
  return data
}

export async function sendCreateProjectRepoReq(jwt: string, id: string, repoId: string, repoName: string): Promise<Project> {
  const query = `
    mutation CreateProjectRepo {
      createProjectRepo(input: {id: "${id}", repoName: "${repoName}", repoId: "${repoId}", sourceType: CUSTOM}) {
          id
          name
          repoId
      }
    }`

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const data: any = await sendGraphQLReqToHypermode(jwt, query)

  const project: Project = data.data.createProjectRepo

  return project
}

export async function sendCreateProjectReq(jwt: string, orgId: string, projectName: string, repoId: string, repoName: string): Promise<Project> {
  const query = `
    mutation CreateProjectBranchBackend {
      createProjectBranchBackend(input: {orgId: "${orgId}", clusterId: "clu-018f07d5-2446-7dbe-a766-dfab00c726de", name: "${projectName}", repoId: "${repoId}", repoName: "${repoName}", sourceType: CUSTOM, defaultBranchName: "main"}
      ) {
          id
          name
          repoId
      }
    }`

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const data: any = await sendGraphQLReqToHypermode(jwt, query)

  const project: Project = data.data.createProjectBranchBackend

  return project
}

export async function sendGetOrgsReq(jwt: string): Promise<Org[]> {
  const query = `
      query GetOrgs {
        getOrgs {
            id
            slug
        }
    }`

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const data: any = await sendGraphQLReqToHypermode(jwt, query)

  const orgs: Org[] = data.data.getOrgs

  return orgs
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
    }`

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const data: any = await sendGraphQLReqToHypermode(jwt, query)

  // eslint-disable-next-line prefer-destructuring
  const projects: Project[] = data.data.getOrg.projects

  return projects
}

export async function sendGetRepoIdReq(jwt: string, installationId: string, gitUrl: string): Promise<string> {
  const query = `
      query getUserRepoIdByUrl {
        getUserRepoIdByUrl(installationId: "${installationId}", gitUrl: "${gitUrl}")
        }`

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const data: any = await sendGraphQLReqToHypermode(jwt, query)

  if (!data.data.getUserRepoIdByUrl) {
    throw new Error('No repoId found for the given installationId and gitUrl')
  }

  return data.data.getUserRepoIdByUrl
}