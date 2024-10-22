import {Command} from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs'

import {fileExists, getEnvFilePath, readSettingsJson} from '../../util/index.js'

export default class LogoutIndex extends Command {
  static override args = {}

  static override description = 'Logout of Hypermode Console in the CLI'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {}

  public async run(): Promise<void> {
    const envFilePath = getEnvFilePath()

    // Check if .env.local file exists
    if (!fileExists(envFilePath)) {
      this.log(chalk.red('Not logged in.') + ' Log in with `hyp login`.')
      return
    }

    const res = readSettingsJson(envFilePath)

    if (!res.email) {
      this.log(chalk.red('Not logged in.') + ' Log in with `hyp login`.')
      return
    }

    console.log('Logging out of email: ' + chalk.dim(res.email))

    // remove all content from settings.json
    fs.writeFileSync(envFilePath, '{}', {flag: 'w'})
  }
}
