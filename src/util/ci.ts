/*
 * Copyright 2024 Hypermode Inc.
 * Licensed under the terms of the Apache License, Version 2.0
 * See the LICENSE file that accompanied this code for further details.
 *
 * SPDX-FileCopyrightText: 2024 Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

export const ciStr = `
name: ci-hypermode-functions

on:
  workflow_dispatch:
  pull_request:
  push:
    branches:
      - main

env:
  MODUS_DIR: ""

permissions:
  contents: read

jobs:
  build:
    name: build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Locate directory with modus.json
        id: set-dir
        run: |
          MODUS_JSON=$(find $(pwd) -name 'modus.json' -print0 | xargs -0 -n1 echo)
          if [ -n "$MODUS_JSON" ]; then
            MODUS_DIR=$(dirname "$MODUS_JSON")
            echo "MODUS_DIR=$MODUS_DIR" >> $GITHUB_ENV
          else
            echo "modus.json not found"
            exit 1
          fi

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Setup Go
        uses: actions/setup-go@v5

      - name: Setup TinyGo
        uses: acifani/setup-tinygo@v2
        with:
          tinygo-version: "0.34.0"

      - name: Build project
        run: npx -p @hypermode/modus-cli -y modus build
        working-directory: \${{ env.MODUS_DIR }}
        shell: bash

      - name: Publish GitHub artifact
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: \${{ env.MODUS_DIR }}/build/*
`;
