hyp
=================

A new CLI for the Hypermode service


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/hyp.svg)](https://npmjs.org/package/hyp)
[![Downloads/week](https://img.shields.io/npm/dw/hyp.svg)](https://npmjs.org/package/hyp)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @hyp/cli
$ hyp COMMAND
running command...
$ hyp (--version)
@hyp/cli/0.0.0 darwin-arm64 node-v20.11.0
$ hyp --help [COMMAND]
USAGE
  $ hyp COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`hyp hello PERSON`](#hyp-hello-person)
* [`hyp hello world`](#hyp-hello-world)
* [`hyp help [COMMAND]`](#hyp-help-command)
* [`hyp plugins`](#hyp-plugins)
* [`hyp plugins add PLUGIN`](#hyp-plugins-add-plugin)
* [`hyp plugins:inspect PLUGIN...`](#hyp-pluginsinspect-plugin)
* [`hyp plugins install PLUGIN`](#hyp-plugins-install-plugin)
* [`hyp plugins link PATH`](#hyp-plugins-link-path)
* [`hyp plugins remove [PLUGIN]`](#hyp-plugins-remove-plugin)
* [`hyp plugins reset`](#hyp-plugins-reset)
* [`hyp plugins uninstall [PLUGIN]`](#hyp-plugins-uninstall-plugin)
* [`hyp plugins unlink [PLUGIN]`](#hyp-plugins-unlink-plugin)
* [`hyp plugins update`](#hyp-plugins-update)

## `hyp hello PERSON`

Say hello

```
USAGE
  $ hyp hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ hyp hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/hypermodeinc/hyp-cli/blob/v0.0.0/src/commands/hello/index.ts)_

## `hyp hello world`

Say hello world

```
USAGE
  $ hyp hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ hyp hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/hypermodeinc/hyp-cli/blob/v0.0.0/src/commands/hello/world.ts)_

## `hyp help [COMMAND]`

Display help for hyp.

```
USAGE
  $ hyp help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for hyp.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.13/src/commands/help.ts)_

## `hyp plugins`

List installed plugins.

```
USAGE
  $ hyp plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ hyp plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/index.ts)_

## `hyp plugins add PLUGIN`

Installs a plugin into hyp.

```
USAGE
  $ hyp plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

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
  Installs a plugin into hyp.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the HYP_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the HYP_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ hyp plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ hyp plugins add myplugin

  Install a plugin from a github url.

    $ hyp plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ hyp plugins add someuser/someplugin
```

## `hyp plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ hyp plugins inspect PLUGIN...

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
  $ hyp plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/inspect.ts)_

## `hyp plugins install PLUGIN`

Installs a plugin into hyp.

```
USAGE
  $ hyp plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

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
  Installs a plugin into hyp.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the HYP_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the HYP_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ hyp plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ hyp plugins install myplugin

  Install a plugin from a github url.

    $ hyp plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ hyp plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/install.ts)_

## `hyp plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ hyp plugins link PATH [-h] [--install] [-v]

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
  $ hyp plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/link.ts)_

## `hyp plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ hyp plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ hyp plugins unlink
  $ hyp plugins remove

EXAMPLES
  $ hyp plugins remove myplugin
```

## `hyp plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ hyp plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/reset.ts)_

## `hyp plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ hyp plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ hyp plugins unlink
  $ hyp plugins remove

EXAMPLES
  $ hyp plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/uninstall.ts)_

## `hyp plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ hyp plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ hyp plugins unlink
  $ hyp plugins remove

EXAMPLES
  $ hyp plugins unlink myplugin
```

## `hyp plugins update`

Update installed plugins.

```
USAGE
  $ hyp plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.10/src/commands/plugins/update.ts)_
<!-- commandsstop -->
