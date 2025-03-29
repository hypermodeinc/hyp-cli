/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { Command } from "@oclif/core";
import chalk from "chalk";
import * as http from "node:http";
import { URL } from "node:url";
import open from "open";

import { sendGetOrgsReq } from "../../util/graphql.js";
import { writeToSettingsFile, promptOrgSelection } from "../../util/index.js";

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
`;

export default class LoginIndex extends Command {
  static override args = {};

  static override description = "Log into Hypermode";

  static override examples = ["<%= config.bin %> <%= command.id %>"];

  static override flags = {};

  public async openLoginPage() {
    // Open the Hypermode sign-in page in the default browser
    const loginUrl = "https://hypermode.com/callback?port=5051&type=cli";
    await open(loginUrl);
  }

  public async run(): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        try {
          const url = new URL(req.url ?? "", `http://${req.headers.host}`);
          const jwt = url.searchParams.get("jwt");
          const email = url.searchParams.get("email");
          const userId = url.searchParams.get("user");

          if (!jwt || !email || !userId) {
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("JWT, email, or userID not found in the request.");
            return;
          }

          const response = await fetch("https://hypermode.com/api/api-key/create", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${jwt}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              name: "CLI Access Key",
              expiresIn: 60 * 60 * 24 * 7, // 7 days
              prefix: "cli",
            }),
          });

          const { data, error } = await response.json();
          const apiKey = data.key;

          if (!apiKey || error) {
            throw new Error(error);
          }

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(loginHTML);

          // Close all existing connections
          server.closeAllConnections();

          // Close the server and wait for it to actually close
          server.close(async (err) => {
            if (err) {
              reject(err);
              return;
            }

            try {
              const orgs = await sendGetOrgsReq(apiKey);
              const selectedOrg = await promptOrgSelection(orgs);
              await writeToSettingsFile(apiKey, email, selectedOrg.workspaces[0].id);
              this.log("Successfully logged in as " + chalk.dim(email) + "! 🎉");
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        } catch (error) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("An error occurred during authentication.");
          reject(error);
        }
      });

      // Set a timeout for the server
      const timeoutDuration = 300_000; // 300 seconds in milliseconds
      const timeout = setTimeout(() => {
        server.closeAllConnections();
        server.close();
        reject(new Error("Authentication timed out. Please try again."));
      }, timeoutDuration);

      // Listen on port 5051 for the redirect
      server.listen(5051, "localhost", async () => {
        try {
          this.log("Opening login page...");
          await this.openLoginPage();
        } catch (error) {
          server.close();
          reject(error);
        }
      });

      // Ensure the timeout is cleared if the server closes successfully
      server.on("close", () => {
        clearTimeout(timeout);
      });

      // Handle server errors
      server.on("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }
}
