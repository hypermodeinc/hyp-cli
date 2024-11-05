import {Command} from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs'
import * as http from 'node:http'
import {URL} from 'node:url'
import open from 'open'

import {ciStr} from '../../util/ci.js'
import {
  getProjectsByOrgReq, sendCreateProjectRepoReq, sendCreateProjectReq, sendGetRepoIdReq,
} from '../../util/graphql.js'
import {
  confirmExistingProjectLink, confirmOverwriteCiHypFile, fileExists, getCiHypFilePath, getEnvFilePath, getGitConfigFilePath,
  getGitRemoteUrl, getGithubWorkflowDir, promptProjectLinkSelection, promptProjectName, readSettingsJson,
} from '../../util/index.js'

export default class LinkIndex extends Command {
  static override args = {}

  static override description = 'Link a Modus App To Hypermode'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {}

  public async getUserInstallationThroughAuthFlow(): Promise<string> {
    return new Promise((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        try {
          const url = new URL(req.url ?? '', `http://${req.headers.host}`)
          const installationId = url.searchParams.get('install_id')

          if (!installationId) {
            res.writeHead(400, {'Content-Type': 'text/plain'})
            res.end('Installation ID not found in the request.')
            return
          }

          res.writeHead(200, {'Content-Type': 'text/html'})
          res.end(linkHTML)

          // Close all existing connections
          server.closeAllConnections()

          // Close the server and wait for it to actually close
          server.close(async err => {
            if (err) {
              reject(err)
              return
            }

            resolve(installationId)
          })
        } catch (error) {
          res.writeHead(500, {'Content-Type': 'text/plain'})
          res.end('An error occurred during authentication.')
          reject(error)
        }
      })

      // Set a timeout for the server
      const timeoutDuration = 300_000 // 300 seconds in milliseconds
      const timeout = setTimeout(() => {
        server.closeAllConnections()
        server.close()
        reject(new Error('Authentication timed out. Please try again.'))
      }, timeoutDuration)

      // Listen on port 5051 for the redirect
      server.listen(5051, 'localhost', async () => {
        try {
          this.log('Opening link page...')
          await this.openLinkPage()
        } catch (error) {
          server.close()
          reject(error)
        }
      })

      // Ensure the timeout is cleared if the server closes successfully
      server.on('close', () => {
        clearTimeout(timeout)
      })

      // Handle server errors
      server.on('error', error => {
        clearTimeout(timeout)
        reject(error)
      })
    })
  }

  public async openLinkPage() {
    // Open the Hypermode sign-in page in the default browser
    const state = encodeURIComponent(JSON.stringify({p: 5051, s: 'cli'}))
    const linkUrl = 'https://github.com/apps/hypermode/installations/new?state=' + state
    await open(linkUrl)
  }

  public async run(): Promise<void> {
    // check if the directory has a .git/config with a remote named 'origin', if not, throw an error and ask them to set that up
    const gitConfigFilePath = getGitConfigFilePath()

    if (!fileExists(gitConfigFilePath)) {
      throw new Error(chalk.red('No .git found in this directory. Please initialize a git repository with `git init`.'))
    }

    const gitUrl = getGitRemoteUrl(gitConfigFilePath)

    // check the .hypermode/settings.json and see if there is a installationId with a key for the github owner. if there is,
    // continue, if not send them to github app installation page, and then go to callback server, and add installation id to settings.json

    const envFilePath = getEnvFilePath()
    if (!fileExists(envFilePath)) {
      this.log(chalk.red('Not logged in.') + ' Log in with `hyp login`.')
      return
    }

    const settings = readSettingsJson(envFilePath)

    if (!settings.email || !settings.jwt || !settings.orgId) {
      this.log(chalk.red('Not logged in.') + ' Log in with `hyp login`.')
      return
    }

    const gitOwner = gitUrl.split('/')[3]

    const repoName = gitUrl.split('/')[4].replace(/\.git$/, '')

    const installationId = (!settings.installationIds || !settings.installationIds[gitOwner]) ? await this.getUserInstallationThroughAuthFlow() : settings.installationIds[gitOwner]

    // call hypermode getRepoId with the installationId and the git url, if it returns a repoId, continue, if not, throw an error
    const repoId = await sendGetRepoIdReq(settings.jwt, installationId, gitUrl)

    if (!repoId) {
      throw new Error('No repoId found for the given installationId and gitUrl')
    }

    // get list of the projects for the user in this org, if any have no repoId, ask if they want to link it, or give option of none.
    // If they pick an option, connect repo. If none, ask if they want to create a new project, prompt for name, and connect repoId to project
    const projects = await getProjectsByOrgReq(settings.jwt, settings.orgId)

    const projectsNoRepoId = projects.filter(project => !project.repoId)

    let selectedProject = null

    if (projectsNoRepoId.length > 0) {
      const confirmExistingProject = await confirmExistingProjectLink()

      if (confirmExistingProject) {
        selectedProject = await promptProjectLinkSelection(projectsNoRepoId)
        const completedProject = await sendCreateProjectRepoReq(settings.jwt, selectedProject.id, repoId, repoName)

        this.log(chalk.green('Successfully linked project ' + completedProject.name + ' to repo ' + repoName + '! 🎉'))
      } else {
        const projectName = await promptProjectName(projects)
        const newProject = await sendCreateProjectReq(settings.jwt, settings.orgId, projectName, repoId, repoName)

        this.log(chalk.green('Successfully created project ' + newProject.name + ' and linked it to repo ' + repoName + '! 🎉'))
      }
    } else {
      const projectName = await promptProjectName(projects)
      const newProject = await sendCreateProjectReq(settings.jwt, settings.orgId, projectName, repoId, repoName)

      this.log(chalk.blueBright('Successfully created project ' + newProject.name + ' and linked it to repo ' + repoName + '! Setting up CI workflow...'))
    }

    // add ci workflow to the repo if it doesn't already exist
    const githubWorkflowDir = getGithubWorkflowDir()
    const ciHypFilePath = getCiHypFilePath()

    if (!fileExists(githubWorkflowDir)) {
      // create the directory
      fs.mkdirSync(githubWorkflowDir, {recursive: true})
    }

    let shouldCreateCIFile = true
    if (fileExists(ciHypFilePath)) {
      // prompt if they want to replace it
      const confirmOverwrite = await confirmOverwriteCiHypFile()
      if (!confirmOverwrite) {
        this.log(chalk.yellow('Skipping ci-hyp.yml creation.'))
        shouldCreateCIFile = false
      }
    }

    if (shouldCreateCIFile) {
      fs.writeFileSync(ciHypFilePath, ciStr)
      this.log(chalk.green('Successfully created ci-hyp.yml! 🎉'))
    }

    this.log(chalk.green('Linking complete! 🎉'))
  }
}

const linkHTML = `<!-- src/commands/login/login.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Success!</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100vw;
        margin: 0;
        background-color: #14161f;
      }
      h1 {
        color: #fff;
        text-align: center;
        margin-bottom: 8px;
      }

      p {
        color: #62646b;
        text-align: center;
      }

      svg {
        width: 36px;
        height: 36px;
        margin-bottom: 16px;
      }
    </style>
  </head>
  <body>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#fff"
        d="M10.0173 0H2.64764L0 10.3598H7.36967L10.0173 0ZM2.91136 22.6282L6.0172 10.3599H14.1776L16.8252 0.00012207H24.1949L18.3248 22.9691H10.9551L14.1592 10.4317L2.91136 22.6282Z"
      />
    </svg>
    <h1>Link complete!</h1>
    <p>You can now close this window and return to the terminal.</p>
  </body>
</html>
`
