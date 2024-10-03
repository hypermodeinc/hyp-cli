import {Command} from '@oclif/core'
import storage from 'node-persist'

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
    await storage.init();
    const email = await storage.getItem('email');
    if (!email) {
      this.log('Not logged in.');
      return;
    }
    
    console.log('Logging out of email: ' + email);
  
    await storage.removeItem('jwt');
    await storage.removeItem('email');
  }
}
