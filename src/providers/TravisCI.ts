import { Context } from 'probot';
import { IssuesCreateCommentParams } from '@octokit/rest';

import { StatusDataObject } from '../types';
import { getStatusData, getPullRequestNumber, buildPullRequestComment } from '../helpers';

const BuildTravisCIComment = async (context: Context): Promise<IssuesCreateCommentParams> => {
  const statusData: StatusDataObject = getStatusData(context);

  const pullRequestNumber = await getPullRequestNumber(context, statusData);

  return {
    owner: statusData.owner,
    repo: statusData.repo,
    issue_number: pullRequestNumber,
    body: buildPullRequestComment(statusData)
  };
};

export default BuildTravisCIComment;
