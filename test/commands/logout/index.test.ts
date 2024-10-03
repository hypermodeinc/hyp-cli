import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import storage from 'node-persist'

describe('logout', () => {
  it('runs logout cmd', async () => {
    await storage.init();
    await storage.setItem('email', 'test@gmail.com');
    const {stdout} = await runCommand('logout')
    expect(stdout).to.contain('test@gmail.com')

    const email = await runCommand('logout')
    expect(email.stdout).to.contain('Not logged in.')
  })
})
