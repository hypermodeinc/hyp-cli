import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('org:switch', () => {
  it('runs org:switch cmd', async () => {
    const {stdout} = await runCommand('org:switch')
    expect(stdout).to.contain('Not logged in.')
  })
})
