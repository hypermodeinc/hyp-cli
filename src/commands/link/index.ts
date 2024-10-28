import {Command} from '@oclif/core'
import chalk from 'chalk'

import {
  fileExists, getEnvFilePath, getGitConfigFilePath, getGitRemoteUrl, getProjectsByOrgGraphQLRequest, promptProjectLinkSelection, promptProjectName, readSettingsJson, sendCreateProjectGraphQLRequest, sendCreateProjectRepoGraphQLRequest, sendGetRepoIdGraphQLRequest,
} from '../../util/index.js'

export default class LinkIndex extends Command {
  static override args = {}

  static override description = 'Link a Modus App To Hypermode'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {}

  public async run(): Promise<void> {
    // check if the directory has a .git/config with a remote named 'origin', if not, throw an error and ask them to set that up
    const gitConfigFilePath = getGitConfigFilePath()

    if (!fileExists(gitConfigFilePath)) {
      throw new Error('No .git/config file found, please set up a remote git repository')
    }

    const gitUrl = getGitRemoteUrl(gitConfigFilePath)

    // check the .hypermode/settings.json and see if there is a installationId with a key for the github owner. if there is,
    // continue, if not send them to github app installation page, and then go to callback server, and add installation id to settings.json

    const envFilePath = getEnvFilePath()
    if (!fileExists(envFilePath)) {
      this.log(chalk.red('Not logged in.') + ' Log in with `hyp login`.')
      return
    }

    const res = readSettingsJson(envFilePath)

    if (!res.email || !res.jwt || !res.orgId) {
      this.log(chalk.red('Not logged in.') + ' Log in with `hyp login`.')
      return
    }

    const gitOwner = gitUrl.split('/')[3]

    const repoName = gitUrl.split('/')[4]

    let installationId = ''

    if (!res.installationIds || !res.installationIds[gitOwner]) {
      // github app installation flow here
    } else  {
      installationId = res.installationIds[gitOwner]
    }

    // call hypermode getRepoId with the installationId and the git url, if it returns a repoId, continue, if not, throw an error
    const repoId = await sendGetRepoIdGraphQLRequest(res.jwt, installationId, gitUrl)

    if (!repoId) {
      throw new Error('No repoId found for the given installationId and gitUrl')
    }

    // get list of the projects for the user in this org, if any have no repoId, ask if they want to link it, or give option of none.
    // If they pick an option, connect repo. If none, ask if they want to create a new project, prompt for name, and connect repoId to project
    const projects = await getProjectsByOrgGraphQLRequest(res.jwt, res.orgId)

    const projectsNoRepoId = projects.filter(project => !project.repoId)

    let selectedProject = null

    if (projectsNoRepoId.length > 0) {
      selectedProject = await promptProjectLinkSelection(projectsNoRepoId)
      const completedProject = await sendCreateProjectRepoGraphQLRequest(res.jwt, selectedProject.id, repoId, repoName)

      this.log(chalk.green('Successfully linked project ' + completedProject.name + ' to repo ' + repoName + '! 🎉'))
    } else {
      const projectName = await promptProjectName(projects)
      const newProject = await sendCreateProjectGraphQLRequest(res.jwt, res.orgId, projectName, repoId, repoName)

      this.log(chalk.green('Successfully created project ' + newProject.name + ' and linked it to repo ' + repoName + '! 🎉'))
    }

    // add ci workflow to the repo if it doesn't already exist
  }
}
