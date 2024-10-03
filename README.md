hyp-cli
=================

A new CLI for the Hypermode service


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/hyp-cli.svg)](https://npmjs.org/package/hyp-cli)
[![Downloads/week](https://img.shields.io/npm/dw/hyp-cli.svg)](https://npmjs.org/package/hyp-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g hyp-cli
$ hyp-cli COMMAND
running command...
$ hyp-cli (--version)
hyp-cli/0.0.0 darwin-arm64 node-v20.11.0
$ hyp-cli --help [COMMAND]
USAGE
  $ hyp-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`hyp-cli hello PERSON`](#hyp-cli-hello-person)
* [`hyp-cli hello world`](#hyp-cli-hello-world)
* [`hyp-cli help [COMMAND]`](#hyp-cli-help-command)
* [`hyp-cli plugins`](#hyp-cli-plugins)
* [`hyp-cli plugins add PLUGIN`](#hyp-cli-plugins-add-plugin)
* [`hyp-cli plugins:inspect PLUGIN...`](#hyp-cli-pluginsinspect-plugin)
* [`hyp-cli plugins install PLUGIN`](#hyp-cli-plugins-install-plugin)
* [`hyp-cli plugins link PATH`](#hyp-cli-plugins-link-path)
* [`hyp-cli plugins remove [PLUGIN]`](#hyp-cli-plugins-remove-plugin)
* [`hyp-cli plugins reset`](#hyp-cli-plugins-reset)
* [`hyp-cli plugins uninstall [PLUGIN]`](#hyp-cli-plugins-uninstall-plugin)
* [`hyp-cli plugins unlink [PLUGIN]`](#hyp-cli-plugins-unlink-plugin)
* [`hyp-cli plugins update`](#hyp-cli-plugins-update)

## `hyp-cli hello PERSON`

Say hello

```
USAGE
  $ hyp-cli hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ hyp-cli hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/hypermodeinc/hyp-cli/blob/v0.0.0/src/commands/hello/index.ts)_

## `hyp-cli hello world`

Say hello world

```
USAGE
  $ hyp-cli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ hyp-cli hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/hypermodeinc/hyp-cli/blob/v0.0.0/src/commands/hello/world.ts)_

## `hyp-cli help [COMMAND]`

Display help for hyp-cli.

```
USAGE
  $ hyp-cli help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for hyp-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.13/src/commands/help.ts)_

## `hyp-cli plugins`

List installed plugins.

```
USAGE
  $ hyp-cli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ hyp-cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/index.ts)_

## `hyp-cli plugins add PLUGIN`

Installs a plugin into hyp-cli.

```
USAGE
  $ hyp-cli plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into hyp-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the HYP_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the HYP_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ hyp-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ hyp-cli plugins add myplugin

  Install a plugin from a github url.

    $ hyp-cli plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ hyp-cli plugins add someuser/someplugin
```

## `hyp-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ hyp-cli plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ hyp-cli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/inspect.ts)_

## `hyp-cli plugins install PLUGIN`

Installs a plugin into hyp-cli.

```
USAGE
  $ hyp-cli plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into hyp-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the HYP_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the HYP_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ hyp-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ hyp-cli plugins install myplugin

  Install a plugin from a github url.

    $ hyp-cli plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ hyp-cli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/install.ts)_

## `hyp-cli plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ hyp-cli plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ hyp-cli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/link.ts)_

## `hyp-cli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ hyp-cli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ hyp-cli plugins unlink
  $ hyp-cli plugins remove

EXAMPLES
  $ hyp-cli plugins remove myplugin
```

## `hyp-cli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ hyp-cli plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/reset.ts)_

## `hyp-cli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ hyp-cli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ hyp-cli plugins unlink
  $ hyp-cli plugins remove

EXAMPLES
  $ hyp-cli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/uninstall.ts)_

## `hyp-cli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ hyp-cli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ hyp-cli plugins unlink
  $ hyp-cli plugins remove

EXAMPLES
  $ hyp-cli plugins unlink myplugin
```

## `hyp-cli plugins update`

Update installed plugins.

```
USAGE
  $ hyp-cli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/update.ts)_
<!-- commandsstop -->
