import {Command} from '@oclif/core'
import * as http from 'node:http'
import storage from 'node-persist'
import open from 'open'




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

    // Initialize storage to persist JWT and email
    await storage.init();

    // Start a local server to capture JWT and email from redirect
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url ?? '', `http://${req.headers.host}`);

      // Extract the JWT and email from query parameters
      const token = url.searchParams.get('jwt');
      const email = url.searchParams.get('email');

      if (token && email) {
        // Store JWT and email securely
        await storage.setItem('jwt', token);
        await storage.setItem('email', email);

        // Send response back to browser indicating success
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Login successful! You can close this tab.');

        // Close the server once JWT and email are captured
        server.close();

        // Confirm successful login in the CLI
        this.log('Successfully logged in as ' + email + '! 🎉');
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
      this.log('Waiting for the login callback on port 5051...');
    });

    // Ensure the timeout is cleared if the server closes successfully
    server.on('close', () => {
      clearTimeout(timeout);
    });
  }
}
