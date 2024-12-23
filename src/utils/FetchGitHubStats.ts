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

const fetchStats = async (username: string): Promise<UserStats> => {
  if (!username) throw new Error("Missing GitHub username");

  const token = import.meta.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GitHub token is missing");
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

    console.log('user', user);

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
    console.error(error);
    if (error instanceof Error) {
      throw new Error("Failed to fetch GitHub stats: " + error.message);
    } else {
      throw new Error("Failed to fetch GitHub stats");
    }
  }
};

export default fetchStats;
