import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('logout', () => {
  it('runs logout cmd', async () => {

    const email = await runCommand('logout')
    expect(email.stdout).to.contain('Not logged in.')
  })
})
