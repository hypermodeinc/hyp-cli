/*
 * Copyright 2024 Hypermode Inc.
 * Licensed under the terms of the Apache License, Version 2.0
 * See the LICENSE file that accompanied this code for further details.
 *
 * SPDX-FileCopyrightText: 2024 Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExitPromptError } from "@inquirer/core";
import * as inquirer from "@inquirer/prompts";
import chalk from "chalk";
import * as fs from "../util/fs.js";
import slugify from "@sindresorhus/slugify";
import * as path from "node:path";
import os from "node:os";

import { Org, Project } from "../util/types.js";

export async function promptOrgSelection(orgs: Org[]): Promise<Org> {
  const choices = orgs.map((org) => ({
    name: org.slug,
    value: org,
  }));
  try {
    const selectedOrg = await inquirer.select({
      choices,
      message: "Please select an organization:",
    });

    return selectedOrg;
  } catch (error) {
    const error_ = error instanceof ExitPromptError ? new TypeError(chalk.red("Organization selection prompt exited.")) : error;
    throw error_;
  }
}

export async function promptProjectLinkSelection(projects: Project[]): Promise<Project> {
  const choices = projects.map((project) => ({
    name: project.name,
    value: project,
  }));
  try {
    const selectedProject = await inquirer.select({
      choices,
      message: "Please select a project to link:",
    });

    return selectedProject;
  } catch (error) {
    const error_ = error instanceof ExitPromptError ? new TypeError(chalk.red("Project selection prompt exited.")) : error;
    throw error_;
  }
}

export async function promptProjectName(projects: Project[]): Promise<string> {
  const projectName = await inquirer.input({
    message: "Creating a new project. Please enter a project name:",
  });

  if (!validateProjectName(projectName)) {
    console.log(chalk.red("Project name must be longer than 3 characters."));
    return promptProjectName(projects);
  }

  // check if project name already exists in projects
  const projectNames = projects.map((project) => project.name);
  if (projectNames.includes(projectName)) {
    // re-prompt for project name
    console.log(chalk.red("Project name already exists."));
    return promptProjectName(projects);
  }

  return projectName;
}

function validateProjectName(projectName: string): boolean {
  return projectName.length > 3;
}

export function getSlugFromName(name: string): string {
  return slugify(name);
}

export async function confirmOverwriteCiHypFile(): Promise<boolean> {
  return inquirer.confirm({
    default: true,
    message: "A ci-modus-build.yml file already exists. Would you like to overwrite it?",
  });
}

export async function confirmExistingProjectLink(): Promise<boolean> {
  return inquirer.confirm({
    default: true,
    message: "You have existing projects with no linked repositories. Would you like to select from these projects?",
  });
}

export function getSettingsDir(): string {
  return path.join(os.homedir(), ".hypermode");
}

export function getSettingsFilePath(): string {
  const settingsDir = getSettingsDir();
  return path.join(settingsDir, "settings.json");
}

export async function fileExists(filePath: string): Promise<boolean> {
  return fs.exists(filePath);
}

export function getGitDir(): string {
  return path.join(process.cwd(), ".git");
}

export function getGithubWorkflowDir(): string {
  return path.join(process.cwd(), ".github", "workflows");
}

export function getCiHypFilePath(): string {
  return path.join(getGithubWorkflowDir(), "ci-modus-build.yml");
}

export function getGitConfigFilePath(): string {
  return path.join(getGitDir(), "config");
}

export async function getGitRemoteUrl(filePath: string): Promise<string | null> {
  const content = await fs.readFile(filePath, "utf8");
  const remoteMatch = content.match(/\[remote "origin"]\n\s+url = (.*)/);

  if (!remoteMatch) {
    return null;
  }

  return remoteMatch[1];
}

export async function readSettingsJson(filePath: string): Promise<{ content: string; email: null | string; installationIds: { [key: string]: string } | null; jwt: null | string; orgId: null | string }> {
  const content = await fs.readFile(filePath, "utf8");

  let email: null | string = null;
  let jwt: null | string = null;
  let orgId: null | string = null;
  let installationIds: { [key: string]: string } | null = null;

  try {
    const jsonContent = JSON.parse(content);
    email = jsonContent.HYP_EMAIL || null;
    jwt = jsonContent.HYP_JWT || null;
    orgId = jsonContent.HYP_ORG_ID || null;
    installationIds = jsonContent.INSTALLATION_IDS || null;
  } catch {
    // ignore error
  }

  return {
    content,
    email,
    installationIds,
    jwt,
    orgId,
  };
}

export async function writeToSettingsFile(jwt: string, email: string, orgId: string): Promise<void> {
  const settingsDir = getSettingsDir();
  const settingsFilePath = getSettingsFilePath();

  // Create the directory if it doesn't exist
  if (!(await fileExists(settingsDir))) {
    await fs.mkdir(settingsDir, { recursive: true });
  }

  const newSettingsContent: { HYP_EMAIL: string; HYP_JWT: string; HYP_ORG_ID: string; INSTALLATION_IDS: { [key: string]: string } | null } = {
    HYP_EMAIL: email,
    HYP_JWT: jwt,
    HYP_ORG_ID: orgId,
    INSTALLATION_IDS: null,
  };

  if (await fileExists(settingsFilePath)) {
    const settings = await readSettingsJson(settingsFilePath);
    newSettingsContent.INSTALLATION_IDS = settings.installationIds;
  }

  // Write the new content to the file, replacing any existing content
  await fs.writeFile(settingsFilePath, JSON.stringify(newSettingsContent, null, 2), { flag: "w" });
}

export async function writeGithubInstallationIdToSettingsFile(gitOwner: string, installationId: string): Promise<void> {
  const settingsFilePath = getSettingsFilePath();
  const settings = await readSettingsJson(settingsFilePath);

  settings.installationIds = settings.installationIds || {};
  settings.installationIds[gitOwner] = installationId;

  const newSettingsContent = {
    HYP_EMAIL: settings.email,
    HYP_JWT: settings.jwt,
    HYP_ORG_ID: settings.orgId,
    INSTALLATION_IDS: settings.installationIds,
  };

  await fs.writeFile(settingsFilePath, JSON.stringify(newSettingsContent, null, 2), { flag: "w" });
}
