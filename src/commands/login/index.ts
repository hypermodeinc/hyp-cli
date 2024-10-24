import {Command} from '@oclif/core'
import * as fs from 'node:fs'
import * as http from 'node:http'
import {createInterface} from 'node:readline'
import {URL} from 'node:url'
import open from 'open'

import {
  fileExists, getEnvDir, getEnvFilePath, promptOrgSelection, sendGraphQLRequest,
} from '../../util/index.js'

const loginHTML = `<!-- src/commands/login/login.html -->
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
    <h1>Authentication complete!</h1>
    <p>You can now close this window and return to the terminal.</p>
  </body>
</html>
`

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
