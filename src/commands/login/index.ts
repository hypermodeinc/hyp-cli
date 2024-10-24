import {Command} from '@oclif/core'
import * as fs from 'node:fs'
import * as http from 'node:http'
import {createInterface} from 'node:readline'
import {URL} from 'node:url'
import open from 'open'

import {
  fileExists, getEnvDir, getEnvFilePath, promptOrgSelection, sendGraphQLRequest,
} from '../../util/index.js'
import loginHTML from './login-html.js'

export default class LoginIndex extends Command {
  static override args = {}

  static override description = 'Login to Hypermode Console'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {}

  public async openLoginPage() {
    // Open the Hypermode sign-in page in the default browser
    const loginUrl = 'https://hypermode.com/app/callback?port=5051&type=cli'
    await open(loginUrl)
  }

  public async run(): Promise<void> {
    // Start a local server to capture JWT and email from redirect
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url ?? '', `http://${req.headers.host}`)

      // Extract the JWT and email from query parameters
      const jwt = url.searchParams.get('jwt')
      const email = url.searchParams.get('email')

      if (jwt && email) {
        // Send response back to browser indicating success
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(loginHTML)

        // Close the server once JWT and email are captured
        server.close()

        const rl = createInterface({
          input: process.stdin,
          output: process.stdout,
        })

        const orgs = await sendGraphQLRequest(jwt)
        const selectedOrg = await promptOrgSelection(rl, orgs)
        // Store JWT and email securely
        this.writeToEnvFile(jwt, email, selectedOrg.id)

        // Confirm successful login in the CLI
        this.log('Successfully logged in as ' + email + '! 🎉')

        rl.close()
      } else {
        // Respond with an error if JWT or email is missing
        res.writeHead(400, {'Content-Type': 'text/plain'})
        res.end('JWT or email not found in the request.')
      }
    })

    // Set a timeout for the server
    const timeoutDuration = 300_000 // 300 seconds in milliseconds
    const timeout = setTimeout(() => {
      server.close()
      throw new Error('Authentication timed out. Please try again.')
    }, timeoutDuration)

    // Listen on port 5051 for the redirect
    server.listen(5051, 'localhost', () => {
      // Open the Hypermode sign-in page in the default browser
      this.log('Opening login page...')
      this.openLoginPage()
    })

    // Ensure the timeout is cleared if the server closes successfully
    server.on('close', async () => {
      clearTimeout(timeout)
    })
  }

  private async writeToEnvFile(jwt: string, email: string, orgId: string): Promise<void> {
    const envDir = getEnvDir()
    const envFilePath = getEnvFilePath()

    // Create the directory if it doesn't exist
    if (!fileExists(envDir)) {
      fs.mkdirSync(envDir, {recursive: true})
    }

    // Prepare the JSON object with the new content
    const newEnvContent = {
      HYP_EMAIL: email,
      HYP_JWT: jwt,
      HYP_ORG_ID: orgId,
    }

    // Write the new content to the file, replacing any existing content
    fs.writeFileSync(envFilePath, JSON.stringify(newEnvContent, null, 2), {flag: 'w'})
  }
}
