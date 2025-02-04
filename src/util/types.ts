/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

export type Org = {
  id: string;
  projects: Project[];
  slug: string;
};

export type Project = {
  id: string;
  name: string;
  repoId: null | string;
};
