import { Context } from 'probot';
import { IssuesCreateCommentParams } from '@octokit/rest';

import { buildPullRequestComment, getPullRequestNumber, getStatusData } from '../helpers';
import { StatusDataObject } from '../types';

/**
 * Collects the data needed to build the PR comment for a CircleCI failed build
 */
const BuildCircleCIComment = async (context: Context): Promise<IssuesCreateCommentParams> => {
  const statusData: StatusDataObject = getStatusData(context);

  const pullRequestNumber = await getPullRequestNumber(context, statusData);

  return {
    owner: statusData.owner,
    repo: statusData.repo,
    issue_number: pullRequestNumber,
    body: buildPullRequestComment(statusData)
  };
};

export default BuildCircleCIComment;
