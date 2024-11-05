
export type Org = {
    id: string
    projects: Project[]
    slug: string
  }

export type Project = {
    id: string
    name: string
    repoId: null | string
  }
