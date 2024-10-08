import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('init:index', () => {
  it('runs init:index cmd', async () => {
    const {stdout} = await runCommand('init:index')
    expect(stdout).to.contain('hello world')
  })

  it('runs init:index --name oclif', async () => {
    const {stdout} = await runCommand('init:index --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
