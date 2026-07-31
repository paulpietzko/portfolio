const GRAPHQL_STATS_QUERY = `
  query userInfo($login: String!) {
    user(login: $login) {
      name
      login
      contributionsCollection {
        totalCommitContributions
        totalPullRequestReviewContributions
      }
      repositoriesContributedTo(first: 1) {
        totalCount
      }
      pullRequests(first: 1) {
        totalCount
      }
      openIssues: issues(states: OPEN) {
        totalCount
      }
      closedIssues: issues(states: CLOSED) {
        totalCount
      }
      followers {
        totalCount
      }
    }
  }
`;

interface UserStats {
  name: string;
  totalCommits: number;
  totalReviews: number;
  totalIssues: number;
  totalPRs: number;
  contributedTo: number;
  followers: number;
}

/**
 * Returns null instead of throwing: GitHub is a third-party dependency and a
 * missing token or an API blip should degrade the section, not fail the build.
 */
const fetchStats = async (username: string): Promise<UserStats | null> => {
  const token = import.meta.env.GITHUB_TOKEN;
  if (!username || !token) {
    console.warn("[github] skipping stats — missing username or GITHUB_TOKEN");
    return null;
  }

  const variables = { login: username };

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: GRAPHQL_STATS_QUERY, variables }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.errors ? result.errors[0].message : "GitHub API error");
    }

    const user = result.data.user;

    return {
      name: user.name || user.login,
      totalCommits: user.contributionsCollection.totalCommitContributions,
      totalReviews: user.contributionsCollection.totalPullRequestReviewContributions,
      totalIssues: user.openIssues.totalCount + user.closedIssues.totalCount,
      totalPRs: user.pullRequests.totalCount,
      contributedTo: user.repositoriesContributedTo.totalCount,
      followers: user.followers.totalCount,
    };
  } catch (error) {
    console.warn("[github] failed to fetch stats:", error);
    return null;
  }
};

export default fetchStats;
