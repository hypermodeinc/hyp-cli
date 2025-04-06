/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { type Command, Help, type Interfaces } from '@oclif/core'
import chalk from 'chalk'

import { getHeader } from './header.js'

export default class CustomHelp extends Help {
  private postPad = 0
  private prePad = 0
  private targetPad = 15
  formatCommand(command: Command.Loadable): string {
    let out = ''
    out +=
      chalk.bold('Usage:') +
      ' ' +
      chalk.bold.blueBright('hyp') +
      ' ' +
      command.id
    return out
  }

  formatCommands(commands: Command.Loadable[]): string {
    let out = ''
    out += chalk.bold('Commands:') + '\n'

    for (const command of commands) {
      if (command.id === 'autocomplete') continue

      const rawName = command.id.includes(':')
        ? command.id.split(':')[1]
        : command.id
      const name = chalk.bold.blueBright(rawName)
      const prePadding = ' '.repeat(Math.max(1, this.prePad - rawName.length))
      const args =
        Object.keys(command.args).length > 0
          ? Object.entries(command.args)
              .map((v) => {
                if (
                  !v[1].hidden &&
                  v[1].required &&
                  v[1].description &&
                  v[1].description.indexOf('-|-') > 0
                ) {
                  return v[1].description.split('-|-')[0]
                }

                return ''
              })
              .join(' ')
          : ''
      const postPadding = ' '.repeat(Math.max(1, this.postPad - args.length))
      const description = command.description!
      const aliases =
        command.aliases.length > 0
          ? chalk.dim(' (' + command.aliases.join('/') + ')')
          : ''

      out +=
        '  ' +
        name +
        prePadding +
        chalk.dim(args) +
        postPadding +
        description +
        aliases +
        '\n'
    }

    return out.trim()
  }

  formatHeader(): string {
    return getHeader(this.config.version)
  }

  formatRoot(): string {
    let out = ''
    out +=
      chalk.bold.blueBright('Hypermode') + ' - Build Intelligent APIs. \n\n'

    // Usage: hyp <command> [...flags] [...args]
    out +=
      chalk.bold('Usage: hyp') +
      ' ' +
      chalk.dim('<command>') +
      ' ' +
      chalk.bold.blueBright('[...flags]') +
      ' ' +
      chalk.bold('[...args]')
    return out
  }

  formatRootFooter(): string {
    let out = ''
    out +=
      'View the docs:' +
      ' '.repeat(Math.max(1, this.prePad + this.postPad - 12)) +
      chalk.blueBright('https://docs.hypermode.com') +
      '\n'
    // out += "View the repo:" + " ".repeat(Math.max(1, this.pre_pad + this.post_pad - 12)) + chalk.blueBright("https://github.com/HypermodeInc/modus") + "\n";

    out += '\n'
    out += 'Made with ♥︎ by Hypermode'
    return out
  }

  formatTopic(topic: Interfaces.Topic): string {
    let out = ''
    out += chalk.bold.blueBright('Hypermode') + ' Help \n\n'
    if (topic.description) out += chalk.dim(topic.description) + '\n'

    out +=
      chalk.bold('Usage: hyp ' + topic.name) +
      ' ' +
      chalk.bold.blue('[command]') +
      '\n'
    return out
  }

  formatTopics(topics: Interfaces.Topic[]): string {
    let out = ''
    if (topics.some((v) => !v.hidden)) out += chalk.bold('Tools:') + '\n'
    else return out

    for (const topic of topics) {
      if (topic.hidden) continue
      out +=
        '  ' +
        chalk.bold.blue(topic.name) +
        ' '.repeat(
          Math.max(1, this.prePad + this.postPad - topic.name.length),
        ) +
        topic.description +
        '\n'
    }

    return out.trim()
  }

  async showCommandHelp(command: Command.Loadable): Promise<void> {
    this.log(this.formatHeader())
    const margin = 20
    const name = command.id.replaceAll(':', ' ')
    const args = Object.keys(command.args)
    const flags = Object.keys(command.flags)

    this.log(
      chalk.bold.blueBright('Hypermode') +
        ' Help ' +
        chalk.dim('(v0.0.0)') +
        '\n',
    )

    if (command.description) this.log(chalk.dim(command.description))

    this.log(
      chalk.bold('Usage:') +
        ' ' +
        chalk.bold('hyp ' + name) +
        (args.length > 0 ? ' [...args]' : '') +
        (flags.length > 0 ? chalk.blueBright(' [...flags]') : '') +
        '\n',
    )
    // if (examples) {
    //     this.log();
    //     this.log(chalk.bold("Examples:") + "\n");
    //     for (const example of examples) this.log("  " + chalk.dim(example));
    // }

    if (flags.length > 0) {
      this.log(chalk.bold('Flags:'))
      for (const flag of Object.values(command.flags))
        this.log(
          '  ' +
            chalk.bold.blueBright('--' + flag.name) +
            ' '.repeat(margin - flag.name.length) +
            flag.description,
        )
    }

    if (args.length > 0) {
      this.log(chalk.bold('Args:'))
      for (const arg of Object.values(command.args)) {
        let desc = arg.description
        if (arg.description?.includes('-|-')) {
          desc = arg.description.split('-|-')[1]
        }

        this.log(
          '  ' +
            chalk.bold.blueBright(arg.name) +
            ' '.repeat(Math.max(1, margin + 2 - arg.name.length)) +
            desc,
        )
      }
    }
  }

  async showRootHelp(): Promise<void> {
    this.log(this.formatHeader())
    let rootTopics = this.sortedTopics
    let rootCommands = this.sortedCommands
    const state = this.config.pjson?.oclif?.state
    if (state) {
      this.log(
        state === 'deprecated'
          ? `${this.config.bin} is deprecated`
          : `${this.config.bin} is in ${state}.\n`,
      )
    }

    this.log(this.formatRoot())
    this.log('')
    if (!this.opts.all) {
      rootTopics = rootTopics.filter((t) => !t.name.includes(':'))
      rootCommands = rootCommands.filter((c) => !c.id.includes(':'))
    }

    for (const command of rootCommands) {
      if (command.id.length > this.prePad) this.prePad = command.id.length
      const args =
        Object.keys(command.args).length > 0
          ? Object.entries(command.args)
              .map((v) => {
                if (
                  !v[1].hidden &&
                  v[1].required &&
                  v[1].description &&
                  v[1].description.indexOf('-|-') > 0
                ) {
                  return v[1].description.split('-|-')[0]
                }

                return ''
              })
              .join(' ')
          : ''
      if (args.length > this.postPad) this.postPad = args.length
    }

    this.postPad =
      6 + this.prePad + this.postPad > this.targetPad
        ? 6 + this.prePad + this.postPad - this.targetPad
        : this.targetPad - this.prePad
    this.prePad += 2

    if (rootTopics.length > 0) {
      this.log(this.formatTopics(rootTopics))
      this.log('')
    }

    if (rootCommands.length > 0) {
      rootCommands = rootCommands.filter((c) => c.id)
      this.log(this.formatCommands(rootCommands))
      this.log('')
    }

    this.log(this.formatRootFooter())
  }

  async showTopicHelp(topic: Interfaces.Topic) {
    this.log(this.formatHeader())
    const { name } = topic
    const commands = this.sortedCommands.filter((c) =>
      c.id.startsWith(name + ':'),
    )
    for (const command of commands) {
      if (command.id.split(':')[1].length > this.prePad)
        this.prePad = command.id.split(':')[1].length
      const args =
        Object.keys(command.args).length > 0
          ? Object.entries(command.args)
              .map((v) => {
                if (
                  !v[1].hidden &&
                  v[1].required &&
                  v[1].description &&
                  v[1].description.indexOf('-|-') > 0
                ) {
                  return v[1].description.split('-|-')[0]
                }

                return ''
              })
              .join(' ')
          : ''
      if (args.length > this.postPad) this.postPad = args.length
    }

    this.postPad =
      6 + this.prePad + this.postPad > this.targetPad
        ? 6 + this.prePad + this.postPad - this.targetPad
        : this.targetPad - this.prePad
    this.prePad += 2
    const state = this.config.pjson?.oclif?.state
    if (state) this.log(`This topic is in ${state}.\n`)
    this.log(this.formatTopic(topic))
    if (commands.length > 0) {
      this.log(this.formatCommands(commands))
      this.log('')
    }
  }
}
