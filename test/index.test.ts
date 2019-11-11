import { Application } from 'probot'

import ciStatusReport from '../src'

const basePayload = {
  installation: { id: 123 },
  repository: {
    name: 'CI-Status-Report-Test',
    owner: { login: 'LoganArnett' }
  },
  commit: { sha: '6b50c5d0ae79e277908c2d60c4e3ab242827c0e3', html_url: 'https://localhost:3000' },
  sender: 'LoganArnett',
  branches: [{ name: 'develop' }]
}

describe('CI-Status-Report Tests', () => {
  let probot: any, github: any

  beforeEach(() => {
    probot = new Application()
    github = {
      issues: { createComment: jest.fn() },
      pulls: { list: jest.fn(() => Promise.resolve([])) }
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
        context: 'ci/circleci',
        target_url: 'https://circleci.com/gh/LoganArnett/ci-status-report-test/1?utm_campaign=vcs-integration-link&utm_medium=referral&utm_source=github-build-link',
      }
    }

    github.pulls.list.mockReturnValueOnce(Promise.resolve({ data: [{ number: 5 }] }))

    await probot.receive(event)
    expect(github.issues.createComment).toHaveBeenCalled()
  })
})
