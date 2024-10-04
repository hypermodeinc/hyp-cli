import {Command} from '@oclif/core'
import * as fs from 'node:fs'
import * as path from 'node:path'


export default class LogoutIndex extends Command {
  static override args = {
  }

  static override description = 'Logout of Hypermode Console in the CLI'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
  }

  public async run(): Promise<void> {
    
    const envDir = path.join(process.env.HOME || '', '.hypermode');
    const envFilePath = path.join(envDir, '.env.local');

    // Check if .env.local file exists
    if (!fs.existsSync(envFilePath)) {
      this.log('Not logged in.');
      return;
    }

    const existingContent = fs.readFileSync(envFilePath, 'utf8');

    // Extract email from .env.local file
    const emailMatch = existingContent.match(/HYP_EMAIL=(.*)/);
    const email = emailMatch ? emailMatch[1] : null;

    if (!email) {
      this.log('Not logged in.');
      return;
    }

    console.log('Logging out of email: ' + email);
  
    // Remove JWT and email from .env.local file
    const updatedContent = existingContent.replace(/HYP_JWT=(.*)\n/, '').replace(/HYP_EMAIL=(.*)\n/, '').replace(/HYP_ORG_ID=(.*)\n/,'');

    fs.writeFileSync(envFilePath, updatedContent.trim() + '\n', { flag: 'w' });
  }

}
