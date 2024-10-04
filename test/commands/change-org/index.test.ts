import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('change-org:index', () => {
  it('runs change-org:index cmd', async () => {
    const {stdout} = await runCommand('change-org:index')
    expect(stdout).to.contain('hello world')
  })

  it('runs change-org:index --name oclif', async () => {
    const {stdout} = await runCommand('change-org:index --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
