import chalk from "chalk";
import * as fs from 'node:fs'
import * as path from 'node:path'
import { Interface , createInterface } from "node:readline";
import fetch from 'node-fetch'


type Org = {
  id: string;
  slug: string;
}


export function ask(question: string, rl: Interface, placeholder?: string): Promise<string> {
    return new Promise<string>((res, _) => {
      rl.question(question + (placeholder ? " " + placeholder + " " : ""), (answer) => {
        res(answer);
      });
    });
  }

  export async function promptOrgSelection(rl: ReturnType<typeof createInterface>, orgs: Org[]): Promise<Org> {
    console.log('Please select an organization:');
    for (const [index, org] of orgs.entries()) {
      console.log(chalk.dim(`${index + 1}. ${org.slug}`));
    }

    const selectedIndex = Number.parseInt(((await ask(chalk.dim("-> "), rl)) || "1").trim(), 10) - 1;

    const org = orgs[selectedIndex];

    if (!org) {
      console.log(chalk.red('Invalid selection. Please try again.'));
      return promptOrgSelection(rl, orgs);
    }

    console.log(`Selected organization: ${chalk.dim(org.slug)}`);

    return org;
  }

  

  export async function sendGraphQLRequest(jwt: string): Promise<Org[]> {
    const url = 'https://api.hypermode.com/graphql';
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

  export function getEnvDir(): string {
    return path.join(process.env.HOME || '', '.hypermode');
  }

  export function getEnvFilePath(): string {
    const envDir = getEnvDir();
    return path.join(envDir, '.env.local');
  }

  export function fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  export function readEnvFile(filePath: string): {content: string, email: null | string, jwt: null | string, orgId: null | string} {
    const content = fs.readFileSync(filePath, 'utf8');

    const jwtMatch = content.match(/HYP_JWT=(.*)/);
    const jwt = jwtMatch ? jwtMatch[1] : null;

    const emailMatch = content.match(/HYP_EMAIL=(.*)/);
    const email = emailMatch ? emailMatch[1] : null;

    const orgIdMatch = content.match(/HYP_ORG_ID=(.*)/);
    const orgId = orgIdMatch ? orgIdMatch[1] : null;

    return {content, email, jwt, orgId};
  }
