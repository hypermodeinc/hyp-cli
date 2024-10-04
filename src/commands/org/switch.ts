import { Command } from '@oclif/core'
import chalk from "chalk";
import * as fs from 'node:fs'
import { createInterface } from "node:readline";

import { fileExists, getEnvFilePath, promptOrgSelection, readEnvFile, sendGraphQLRequest } from '../../util/index.js'


export default class OrgSwitch extends Command {
  static override args = {
  }

  static override description = 'Switch the current Hypermode organization'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {}

  public async run(): Promise<void> {
    const envFilePath = getEnvFilePath();
    if(!fileExists(envFilePath)) {
      this.log(chalk.red('Not logged in.') + ' Log in with `hyp login`.');
      return;
    }

    const res = readEnvFile(envFilePath);

    if (!res.email || !res.jwt || !res.orgId) {
      this.log(chalk.red('Not logged in.') + ' Log in with `hyp login`.');
      return;
    }

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const orgs = await sendGraphQLRequest(res.jwt);
    const selectedOrg = await promptOrgSelection(rl, orgs);

    const updatedContent = res.content
      .split('\n')
      .map((line) => {
        if (line.startsWith('HYP_ORG_ID')) {
          return `HYP_ORG_ID=${selectedOrg.id}`;
        }

        return line;
      })
      .join('\n');

    fs.writeFileSync(envFilePath, updatedContent.trim() + '\n', { flag: 'w' });

    rl.close();
  }
}
