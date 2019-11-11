import { Context } from 'probot';

import { StatusDataObject } from '../types';

const logos = {
  circleCI:
    '<img width="400" height="125" src="http://cloud.loganarnett.com/f3467142ee70/Image%2525202019-11-08%252520at%2525202.31.28%252520AM.png">'
};

/**
 * Extracts the build number from the target_url
 */
const getBuildNumber = (targetUrl: string): string => {
  var split = targetUrl.split('/');
  return split[split.length - 1].split('?')[0];
};

/**
 * Parses the 'status' event context payload
 */
export const getStatusData = (context: Context): StatusDataObject => {
  const {
    payload: {
      commit: { sha, html_url },
      sender,
      branches,
      target_url,
      repository: { owner, name }
    }
  } = context;

  return {
    buildNumber: getBuildNumber(target_url),
    commitSha: sha.substring(0, 7),
    commitUrl: html_url,
    committerName: sender.login,
    branchName: branches[0].name,
    targetUrl: target_url,
    owner: owner.login,
    repo: name
  };
};

/**
 * Requests the Pull Request number from GitHub
 */
export const getPullRequestNumber = async (context: Context, { owner, repo, committerName, branchName }: StatusDataObject): Promise<number> => {
  const allPullRequests = await context.github.pulls.list({
    owner,
    repo,
    head: `${committerName}:${branchName}`
  });

  return allPullRequests.data[0].number;
};

/**
 * Builds and Formats the comment to be applied to the Pull Request
 */
export const buildPullRequestComment = ({ buildNumber, targetUrl, commitSha, commitUrl }: StatusDataObject): string => {
  let pullRequestComment = `
<p align="center">
${logos.circleCI}
</p>
\n
## Build [#${buildNumber}](${targetUrl}) Failed
\n
This PR is moving right along but the build has failed - [#${buildNumber}](${targetUrl}).
\n
The commit that started this build can be found here [**${commitSha}**](${commitUrl}).
\n
Once you have updated the PR and the build is passing then :shipit:
\n
`;

  return pullRequestComment;
};
