import { Application, Context } from 'probot' // eslint-disable-line no-unused-vars
import { IssuesCreateCommentParams } from '@octokit/rest' // eslint-disable-line no-unused-vars

import { BuildCircleCIComment, BuildTravisCIComment } from './providers'

/**
 * Check for CI provider match
 */
const checkCIProvider = (context: string): boolean | string => {
  const matchedContext = context.match(/circleci|travis/)
  return matchedContext ? matchedContext[0] : false
}

/**
 * Listens for the 'status' event and reacts to 'failure' state
 */
async function onStatus (statusContext: Context): Promise<void> {
  const { payload } = statusContext

  const ciProvider = checkCIProvider(payload.context)
  if (payload.state !== 'failure' || !ciProvider) return

  try {
    const comment: IssuesCreateCommentParams = await (ciProvider === 'circleci'
      ? BuildCircleCIComment(statusContext)
      : BuildTravisCIComment(statusContext))

    await statusContext.github.issues.createComment(comment)
  } catch (err) {
    console.log(err)
  }
}

export = (app: Application) => {
  app.on('status', onStatus)
}
