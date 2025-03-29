/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

export type Org = {
  id: string;
  name: string;
  slug: string;
  workspaces: Workspace[];
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  apps: App[];
};

export type App = {
  id: string;
  name: string;
  repoId: null | string;
};
