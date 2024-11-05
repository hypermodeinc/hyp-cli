import {ExitPromptError} from '@inquirer/core'
import * as inquirer from '@inquirer/prompts'
import chalk from 'chalk'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {Interface} from 'node:readline'

import {Org, Project} from '../util/types.js'

export function ask(question: string, rl: Interface, placeholder?: string): Promise<string> {
  return new Promise<string>((res) => {
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

export async function promptProjectLinkSelection(projects: Project[]): Promise<Project> {
  const choices = projects.map(project => ({
    name: project.name,
    value: project,
  }))
  try {
    const selectedProject = await inquirer.select({
      choices,
      message: 'Please select a project to link:',
    })

    return selectedProject
  } catch (error) {
    const error_ = error instanceof ExitPromptError ? new TypeError(chalk.red('Project selection prompt exited.')) : error
    throw error_
  }
}

export async function promptProjectName(projects: Project[]): Promise<string> {
  const projectName = await inquirer.input({
    message: 'Creating a new project. Please enter a project name:',
  })

  // check if project name already exists in projects
  const projectNames = projects.map(project => project.name)
  if (projectNames.includes(projectName)) {
    // re-prompt for project name
    console.log(chalk.red('Project name already exists.'))
    return promptProjectName(projects)
  }

  return projectName
}

export async function confirmOverwriteCiHypFile(): Promise<boolean> {
  return inquirer.confirm({
    default: true,
    message: 'A ci-hyp.yml file already exists. Would you like to overwrite it?',
  })
}

export function confirmExistingProjectLink(): Promise<boolean> {
  return inquirer.confirm({
    default: true,
    message: 'You have existing projects with no linked repositories. Would you like to select from these projects?',
  })
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

export function getGitDir(): string {
  return path.join(process.cwd(), '.git')
}

export function getGithubWorkflowDir(): string {
  return path.join(process.cwd(), '.github', 'workflows')
}

export function getCiHypFilePath(): string {
  return path.join(getGithubWorkflowDir(), 'ci-hyp.yml')
}

export function getGitConfigFilePath(): string {
  return path.join(getGitDir(), 'config')
}

export function getGitRemoteUrl(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf8')
  const remoteMatch = content.match(/\[remote "origin"]\n\s+url = (.*)/)
  if (!remoteMatch) {
    throw new Error(chalk.red('No remote origin found in .git/config, please set up a remote origin with `git remote add origin <url>`.'))
  }

  return remoteMatch[1]
}

export function readSettingsJson(filePath: string): {
  content: string
  email: null | string
  installationIds: { [key: string]: string } | null
  jwt: null | string
  orgId: null | string
} {
  const content = fs.readFileSync(filePath, 'utf8')

  let email: null | string = null
  let jwt: null | string = null
  let orgId: null | string = null
  let installationIds: { [key: string]: string } | null = null

  try {
    const jsonContent = JSON.parse(content)
    email = jsonContent.HYP_EMAIL || null
    jwt = jsonContent.HYP_JWT || null
    orgId = jsonContent.HYP_ORG_ID || null
    installationIds = jsonContent.INSTALLATION_IDS || null
  } catch {
    // ignore error
  }

  return {
    content, email, installationIds, jwt, orgId,
  }
}
