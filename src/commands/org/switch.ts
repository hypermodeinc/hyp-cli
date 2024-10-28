import {Command} from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs'

import {
  fileExists, getEnvFilePath, promptOrgSelection, readSettingsJson, sendGetOrgsGraphQLRequest,
} from '../../util/index.js'

export default class OrgSwitch extends Command {
  static override args = {}

  static override description = 'Switch the current Hypermode organization'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {}

  public async run(): Promise<void> {
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

    const orgs = await sendGetOrgsGraphQLRequest(res.jwt)
    const selectedOrg = await promptOrgSelection(orgs)

    const updatedContent = {
      HYP_EMAIL: res.email,
      HYP_JWT: res.jwt,
      HYP_ORG_ID: selectedOrg.id,
    }

    fs.writeFileSync(envFilePath, JSON.stringify(updatedContent, null, 2), {flag: 'w'})
  }
}
