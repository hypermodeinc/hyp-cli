import {Command} from '@oclif/core'
import chalk from "chalk";
import * as fs from 'node:fs'
import * as http from 'node:http'
import * as path from 'node:path'
import { createInterface } from "node:readline";
import fetch from 'node-fetch'
import open from 'open'

import { ask, clearLine } from '../../util/index.js'

type Org = {
  id: string;
  slug: string;
}

export default class LoginIndex extends Command {
  static override args = {
  }

  static override description = 'Login to Hypermode Console'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
  }

  public async openLoginPage() {
    // Open the Hypermode sign-in page in the default browser
    const loginUrl = 'https://hypermode-stage.com/app/callback?port=5051&type=cli';
    await open(loginUrl);
  }

  public async run(): Promise<void> {

    // Start a local server to capture JWT and email from redirect
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url ?? '', `http://${req.headers.host}`);

      // Extract the JWT and email from query parameters
      const jwt = url.searchParams.get('jwt');
      const email = url.searchParams.get('email');

      if (jwt && email) {
        // Send response back to browser indicating success
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Login successful! You can close this tab.');

        // Close the server once JWT and email are captured
        server.close();

        const rl = createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const orgs = await this.sendGraphQLRequest(jwt);
        const selectedOrg = await this.promptOrgSelection(rl, orgs);
        // Store JWT and email securely
        this.writeToEnvFile(jwt, email, selectedOrg.id);

        // Confirm successful login in the CLI
        this.log('Successfully logged in as ' + email + '! 🎉');

        rl.close();
        
      } else {
        // Respond with an error if JWT or email is missing
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('JWT or email not found in the request.');

      }
    });

    // Set a timeout for the server
    const timeoutDuration = 300_000; // 300 seconds in milliseconds
    const timeout = setTimeout(() => {
      server.close();
      throw new Error('Authentication timed out. Please try again.');
    }, timeoutDuration);

    // Listen on port 5051 for the redirect
    server.listen(5051, 'localhost', () => {
      // Open the Hypermode sign-in page in the default browser
      this.log('Opening login page...');
      this.openLoginPage();
    });

    // Ensure the timeout is cleared if the server closes successfully
    server.on('close', async () => {
      clearTimeout(timeout);
    });

  }

  private async promptOrgSelection(rl: ReturnType<typeof createInterface>, orgs: Org[]): Promise<Org> {
    this.log('Please select an organization:');
    for (const [index, org] of orgs.entries()) {
      this.log(chalk.dim(`${index + 1}. ${org.slug}`));
    }

    const selectedIndex = Number.parseInt(((await ask(chalk.dim("-> "), rl)) || "1").trim(), 10) - 1;

    const org = orgs[selectedIndex];
    clearLine();
    clearLine();

    if (!org) {
      this.log(chalk.red('Invalid selection. Please try again.'));
      return this.promptOrgSelection(rl, orgs);
    }

    this.log(`Selected organization: ${chalk.dim(org.slug)}`);

    return org;
  }

  

  private async sendGraphQLRequest(jwt: string): Promise<Org[]> {
    const url = 'https://api.hypermode-stage.com/graphql';
    const query = `
    query GetOrgs {
      getOrgs {
          id
          slug
      }
  }`

  const options = {
    body: JSON.stringify({ query }),
    headers: {
      'Authorization': `${jwt}`,
      'Content-Type': 'application/json'
    },
    method: 'POST'
  };

  const response = await fetch(url, options);


/* eslint-disable  @typescript-eslint/no-explicit-any */
  const data: any = await response.json();

  const orgs: Org[] = data.data.getOrgs;

  return orgs;
  }

  private async writeToEnvFile(jwt: string, email: string, orgId: string): Promise<void> {
    const envDir = path.join(process.env.HOME || '', '.hypermode');
    const envFilePath = path.join(envDir, '.env.local');

    // Create the directory if it doesn't exist
    if (!fs.existsSync(envDir)) {
      fs.mkdirSync(envDir, { recursive: true });
    }

    // Prepare the new content
    const newEnvContent = `HYP_JWT=${jwt}\nHYP_EMAIL=${email}\nHYP_ORG_ID=${orgId}\n`;

    // Check if the .env.local file exists
    if (fs.existsSync(envFilePath)) {
      // Read existing content
      const content = fs.readFileSync(envFilePath, 'utf8');

      // Check if the file contains HYP_JWT and HYP_EMAIL, if not add them
      const updatedContent = !content.includes('HYP_JWT=') || !content.includes('HYP_EMAIL=') || !content.includes('HYP_ORG_ID=')
        ? content + `HYP_JWT=${jwt}\nHYP_EMAIL=${email}\nHYP_ORG_ID=${orgId}\n`
        : content
            .split('\n')
            .map(line => {
              if (line.startsWith('HYP_JWT=')) return `HYP_JWT=${jwt}`;
              if (line.startsWith('HYP_EMAIL=')) return `HYP_EMAIL=${email}`;
              if (line.startsWith('HYP_ORG_ID=')) return `HYP_ORG_ID=${orgId}`;
              return line; // Keep other lines unchanged
            })
            .join('\n');

      // delete the file
      fs.unlinkSync(envFilePath);
      // Write back the updated content
      fs.writeFileSync(envFilePath, updatedContent.trim() + '\n', { flag: 'w' });
    } else {
      // If the file doesn't exist, create it
      fs.writeFileSync(envFilePath, newEnvContent, { flag: 'w' });
    }
  }
}
