import {ExitPromptError} from '@inquirer/core'
import * as inquirer from '@inquirer/prompts'
import chalk from 'chalk'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {Interface} from 'node:readline'
import fetch from 'node-fetch'

type Org = {
  id: string
  slug: string
}

export function ask(question: string, rl: Interface, placeholder?: string): Promise<string> {
  return new Promise<string>((res, _) => {
    rl.question(question + (placeholder ? ' ' + placeholder + ' ' : ''), answer => {
      res(answer)
    })
  })
}

export async function promptOrgSelection(orgs: Org[]): Promise<Org> {
  const choices = orgs.map(org => ({
    name: org.slug,
    value: org,
  }))
  try {
    const selectedOrg = await inquirer.select({
      choices,
      message: 'Please select an organization:',
    })

    return selectedOrg
  } catch (error) {
    const error_ = error instanceof ExitPromptError ? new TypeError(chalk.red('Organization selection prompt exited.')) : error
    throw error_
  }
}

export async function sendGraphQLRequest(jwt: string): Promise<Org[]> {
  const url = 'https://api.hypermode.com/graphql'
  const query = `
    query GetOrgs {
      getOrgs {
          id
          slug
      }
  }`

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

  const orgs: Org[] = data.data.getOrgs

  return orgs
}

export function getEnvDir(): string {
  return path.join(process.env.HOME || '', '.hypermode')
}

export function getEnvFilePath(): string {
  const envDir = getEnvDir()
  return path.join(envDir, 'settings.json')
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}

export function readSettingsJson(filePath: string): {
  content: string
  email: null | string
  jwt: null | string
  orgId: null | string
} {
  const content = fs.readFileSync(filePath, 'utf8')

  let email: null | string = null
  let jwt: null | string = null
  let orgId: null | string = null

  try {
    const jsonContent = JSON.parse(content)
    email = jsonContent.HYP_EMAIL || null
    jwt = jsonContent.HYP_JWT || null
    orgId = jsonContent.HYP_ORG_ID || null
  } catch (error) {
    console.error('Error parsing JSON content:', error)
  }

  return {
    content, email, jwt, orgId,
  }
}
