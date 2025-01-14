/*
 * Copyright 2025 Hypermode Inc.
 * Licensed under the terms of the Apache License, Version 2.0
 * See the LICENSE file that accompanied this code for further details.
 *
 * SPDX-FileCopyrightText: 2025 Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { Command } from "@oclif/core";
import chalk from "chalk";
import * as fs from "../../util/fs.js";

import { fileExists, getSettingsFilePath, readSettingsJson } from "../../util/index.js";

export default class LogoutIndex extends Command {
  static override args = {};

  static override description = "Log Hyp CLI out of Hypermode";

  static override examples = ["<%= config.bin %> <%= command.id %>"];

  static override flags = {};

  public async run(): Promise<void> {
    const settingsFilePath = getSettingsFilePath();

    // Check if .env.local file exists
    if (!(await fileExists(settingsFilePath))) {
      this.log(chalk.red("Not logged in.") + " Log in with `hyp login`.");
      return;
    }

    const res = await readSettingsJson(settingsFilePath);

    if (!res.email) {
      this.log(chalk.red("Not logged in.") + " Log in with `hyp login`.");
      return;
    }

    console.log("Logging out of email: " + chalk.dim(res.email));

    const newSettingsContent = {
      HYP_EMAIL: null,
      HYP_JWT: null,
      HYP_ORG_ID: null,
      INSTALLATION_IDS: res.installationIds,
    };

    // remove all content from settings.json
    await fs.writeFile(settingsFilePath, JSON.stringify(newSettingsContent, null, 2), { flag: "w" });
  }
}
