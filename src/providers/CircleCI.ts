import { Context } from 'probot'
import rp from 'request-promise-native'
import { IssuesCreateCommentParams } from '@octokit/rest'

import { buildPullRequestComment, getPullRequestNumber, getStatusData } from '../helpers'
import { StatusDataObject, CircleCIStep, CircleCIStepAction } from '../types'

const userAgentHeader = { 'User-Agent': 'Request-Promise' }

/**
 * Requests the build information from the Circle CI API
 */
const getCircleCIBuildUrl = async ({ owner, repo, buildNumber }: StatusDataObject) => {
  const { steps } = await rp({
    uri: `https://circleci.com/api/v1.1/project/github/${owner}/${repo}/${buildNumber}`,
    headers: userAgentHeader,
    json: true
  })

  return getCircleCIOutputUrl(steps)
}

/**
 * Extracts the output_url from the failed step in the build from Circle CI
 */
const getCircleCIOutputUrl = (steps: CircleCIStepAction[]): string => {
  let outputUrl = ''
  steps.map((step: CircleCIStepAction) => {
    const filtered: CircleCIStep[] = step.actions.filter((step: CircleCIStep) => step.failed && step.output_url)
    if (filtered.length > 0) {
      outputUrl = filtered[0].output_url
    }
  })
  return outputUrl
}

/**
 * Requests the Circle CI Build Logs from the output_url
 */
const getCircleCILogs = async (uri: string): Promise<Buffer> =>
  rp({
    uri,
    headers: userAgentHeader,
    encoding: null,
    gzip: true
  })

/**
 * Collects the data needed to build the PR comment for a CircleCI failed
 */
const BuildCircleCIComment = async (context: Context): Promise<IssuesCreateCommentParams> => {
  const statusData: StatusDataObject = getStatusData(context)

  const [pullRequestNumber, buildUrl] = await Promise.all([getPullRequestNumber(context, statusData), getCircleCIBuildUrl(statusData)])

  const CILogsBuffer: Buffer = await getCircleCILogs(buildUrl)

  return {
    owner: statusData.owner,
    repo: statusData.repo,
    issue_number: pullRequestNumber,
    body: buildPullRequestComment(statusData, CILogsBuffer)
  }
}

export default BuildCircleCIComment
