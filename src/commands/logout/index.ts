import {Command} from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs'

import {fileExists, getEnvFilePath, readEnvFile} from '../../util/index.js'

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

    const res = readEnvFile(envFilePath)

    if (!res.email) {
      this.log(chalk.red('Not logged in.') + ' Log in with `hyp login`.')
      return
    }

    console.log('Logging out of email: ' + chalk.dim(res.email))

    // Remove JWT and email from .env.local file
    const updatedContent = res.content
    .split('\n')
    .map(line => {
      if (line.startsWith('HYP_JWT') || line.startsWith('HYP_EMAIL') || line.startsWith('HYP_ORG_ID')) {
        return ''
      }

      return line
    })
    .join('\n')

    fs.writeFileSync(envFilePath, updatedContent.trim() + '\n', {flag: 'w'})
  }
}
