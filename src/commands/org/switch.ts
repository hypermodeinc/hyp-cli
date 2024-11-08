/*
 * Copyright 2024 Hypermode Inc.
 * Licensed under the terms of the Apache License, Version 2.0
 * See the LICENSE file that accompanied this code for further details.
 *
 * SPDX-FileCopyrightText: 2024 Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { Command } from "@oclif/core";
import chalk from "chalk";

import { sendGetOrgsReq } from "../../util/graphql.js";
import { fileExists, getSettingsFilePath, promptOrgSelection, readSettingsJson, writeToSettingsFile } from "../../util/index.js";

export default class OrgSwitch extends Command {
  static override args = {};

  static override description = "Switch the current Hypermode organization";

  static override examples = ["<%= config.bin %> <%= command.id %>"];

  static override flags = {};

  public async run(): Promise<void> {
    const settingsFilePath = getSettingsFilePath();
    if (!(await fileExists(settingsFilePath))) {
      this.log(chalk.red("Not logged in.") + " Log in with `hyp login`.");
      return;
    }

    const res = await readSettingsJson(settingsFilePath);

    if (!res.email || !res.jwt || !res.orgId) {
      this.log(chalk.red("Not logged in.") + " Log in with `hyp login`.");
      return;
    }

    const orgs = await sendGetOrgsReq(res.jwt);
    const selectedOrg = await promptOrgSelection(orgs);

    await writeToSettingsFile(res.jwt, res.email, selectedOrg.id);
  }
}
