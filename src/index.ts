import { Application, Context } from 'probot' // eslint-disable-line no-unused-vars

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
const onStatus = async (statusContext: Context): Promise<void> => {
  const { payload } = statusContext

  const ciProvider = checkCIProvider(payload.context)
  if (payload.state !== 'failure' || !ciProvider) return

  console.log('Build the Comment with Build Info Here')

  await statusContext.github.issues.createComment({
    owner: 'LoganArnett',
    repo: 'CI-Status-Report-Test',
    issue_number: 1,
    body: 'Testing Testing'
  })
}

export default (app: Application) => {
  app.on('status', onStatus)
}
