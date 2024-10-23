# hyp

A new CLI for the Hypermode service

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/hyp.svg)](https://npmjs.org/package/hyp)
[![Downloads/week](https://img.shields.io/npm/dw/hyp.svg)](https://npmjs.org/package/hyp)

<!-- toc -->
* [hyp](#hyp)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g @hypermode/hyp-cli
$ hyp COMMAND
running command...
$ hyp (--version)
@hypermode/hyp-cli/0.0.1-alpha.1 darwin-arm64 node-v22.9.0
$ hyp --help [COMMAND]
USAGE
  $ hyp COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`hyp login`](#hyp-login)
* [`hyp logout`](#hyp-logout)
* [`hyp org switch`](#hyp-org-switch)

## `hyp login`

Login to Hypermode Console

```
[1mUsage:[22m [1m[94mhyp[39m[22m login
```

_See code: [src/commands/login/index.ts](https://github.com/hypermodeinc/hyp-cli/blob/v0.0.1-alpha.1/src/commands/login/index.ts)_

## `hyp logout`

Logout of Hypermode Console in the CLI

```
[1mUsage:[22m [1m[94mhyp[39m[22m logout
```

_See code: [src/commands/logout/index.ts](https://github.com/hypermodeinc/hyp-cli/blob/v0.0.1-alpha.1/src/commands/logout/index.ts)_

## `hyp org switch`

Switch the current Hypermode organization

```
[1mUsage:[22m [1m[94mhyp[39m[22m org:switch
```

_See code: [src/commands/org/switch.ts](https://github.com/hypermodeinc/hyp-cli/blob/v0.0.1-alpha.1/src/commands/org/switch.ts)_
<!-- commandsstop -->
