const GRAPHQL_COMMITS_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      repositories(first: 100) {
        nodes {
          name
          ref(qualifiedName: "refs/heads/master") {
            target {
              ... on Commit {
                history(first: 100) {
                  nodes {
                    committedDate
                    message
                    author {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const fetchUserCommits = async (username: string): Promise<number[]> => {
  const variables = { login: username };

  const token = import.meta.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GitHub token is missing");
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: GRAPHQL_COMMITS_QUERY, variables }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch commits");
  }

  const data = await response.json();

  // Error handling for missing data structure
  if (!data?.data?.user?.repositories?.nodes) {
    throw new Error("Unexpected GraphQL response structure");
  }

  return processCommitData(data.data.user.repositories.nodes);
};

const processCommitData = (repositories: any[]): number[] => {
  const commitsByMonth = new Array(12).fill(0);
  const now = new Date();

  repositories.forEach((repo: any) => {
    if (repo?.ref?.target?.history?.nodes) {
      repo.ref.target.history.nodes.forEach((commit: any) => {
        const commitDate = new Date(commit.committedDate);
        const diffInMonths =
          now.getFullYear() * 12 +
          now.getMonth() -
          (commitDate.getFullYear() * 12 + commitDate.getMonth());

        if (diffInMonths >= 0 && diffInMonths < 12) {
          commitsByMonth[11 - diffInMonths]++;
        }
      });
    }
  });
  
  return commitsByMonth;
};

export default fetchUserCommits;
