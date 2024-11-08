/*
 * Copyright 2024 Hypermode Inc.
 * Licensed under the terms of the Apache License, Version 2.0
 * See the LICENSE file that accompanied this code for further details.
 *
 * SPDX-FileCopyrightText: 2024 Hypermode Inc. <hello@hypermode.com>
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
