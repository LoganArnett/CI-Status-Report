import fs from 'fs'
import nock from 'nock'
import path from 'path'
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

  describe('Circle CI Tests', () => {
    let event: any

    const build: any = fs.readFileSync(path.join(__dirname, 'fixtures/CircleCI', 'build-status.json'), 'utf8')
    const buildLogs: any = fs.readFileSync(path.join(__dirname, 'fixtures/CircleCI', 'build-logs.json'), 'utf8')

    beforeEach(() => {
      event = {
        name: 'status',
        payload: {
          ...basePayload,
          target_url: 'https://circleci.com/gh/LoganArnett/CI-Status-Report-Test/7?utm_campaign=vcs-integration-link&utm_medium=referral&utm_source=github-build-link',
          context: 'ci/circleci',
          state: 'failure'
        }
      }
    })

    it('should create a PR comment for a failed build', async () => {
      nock('https://circleci.com')
        .get('/api/v1.1/project/github/LoganArnett/CI-Status-Report-Test/7').reply(200, build)
        .get('/circleci-logs-output-url').reply(200, buildLogs)

      github.pulls.list.mockReturnValueOnce(Promise.resolve({ data: [{ number: 5 }] }))

      await probot.receive(event)
      expect(github.issues.createComment).toHaveBeenCalledTimes(1)

      const commentBody = github.issues.createComment.mock.calls[0][0]

      expect(commentBody.owner).toBe('LoganArnett')
      expect(commentBody.repo).toBe('CI-Status-Report-Test')
      expect(commentBody.issue_number).toBe(5)
      expect(commentBody.body).toMatchSnapshot()
    })
  })

  describe('Travis CI Tests', () => {
    it('should create a PR comment for a failed build', async () => {
      nock('https://api.travis-ci.org')
        .get('/build/123').reply(200, {
          pull_request_number: 1,
          jobs: [{ id: 1234, number: 3, state: 'failed' }]
        })

      const event = {
        name: 'status',
        payload: {
          ...basePayload,
          target_url: 'https://travis-ci.org/LoganArnett/ci-status-report/builds/3?utm_source=github_status&utm_medium=notification',
          context: 'continuous-integration/travis-ci/pr',
          state: 'failure'
        }
      }

      github.pulls.list.mockReturnValueOnce(Promise.resolve({ data: [{ number: 5 }] }))

      await probot.receive(event)
      expect(github.issues.createComment).toHaveBeenCalledTimes(1)

      const commentBody = github.issues.createComment.mock.calls[0][0]

      expect(commentBody.owner).toBe('LoganArnett')
      expect(commentBody.repo).toBe('CI-Status-Report-Test')
      expect(commentBody.issue_number).toBe(5)
      expect(commentBody.body).toMatchSnapshot()
    })
  })
})
