import { Application } from 'probot'

import ciStatusReport from '../src'

const basePayload = {
  installation: { id: 123 },
  repository: {
    name: 'CI-Status-Report-Test',
    owner: { login: 'LoganArnett' }
  }
}

describe('CI-Status-Report Tests', () => {
  let probot: any, github: any

  beforeEach(() => {
    probot = new Application()
    github = {
      issues: { createComment: jest.fn() }
    }

    probot.auth = jest.fn(() => Promise.resolve(github))
    ciStatusReport(probot)
  })

  it('should not create a comment when the state is anything but "failure"', async () => {
    const event = {
      name: 'status',
      payload: {
        ...basePayload,
        state: 'passed',
        context: 'ci/circleci'
      }
    }

    await probot.receive(event)
    expect(github.issues.createComment).not.toHaveBeenCalled()
  })

  it('should not create a comment for a context that it does not support', async () => {
    const event = {
      name: 'status',
      payload: {
        ...basePayload,
        state: 'failure',
        context: 'unsupported/context/provider'
      }
    }

    await probot.receive(event)
    expect(github.issues.createComment).not.toHaveBeenCalled()
  })

  it('should create a comment', async () => {
    const event = {
      name: 'status',
      payload: {
        ...basePayload,
        state: 'failure',
        context: 'ci/circleci'
      }
    }

    await probot.receive(event)
    expect(github.issues.createComment).toHaveBeenCalled()
  })
})
