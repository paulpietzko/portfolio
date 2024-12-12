import { createSignal, createEffect } from "solid-js";

async function getGitHubStats(username: string) {
  try {
    // Fetch user data
    const userResponse = await fetch(`https://paulpietzko.vercel.app/api/github/user.json`);
    const userData = await userResponse.json();

    // Fetch repository data
    const reposResponse = await fetch(`https://paulpietzko.vercel.app/api/github/repos.json`);
    const repos = await reposResponse.json();

    // Mock data for illustration
    let totalCommits = 0;
    let totalIssues = 0;
    let totalPRs = 0;
    let totalStars = 0;

    for (const repo of repos) {
      const repoResponse = await fetch(repo.url);
      const repoData = await repoResponse.json();
      totalCommits += repoData.commits_count || 0;
      totalIssues += repoData.open_issues_count || 0;
      totalPRs += repoData.pulls_count || 0;
      totalStars += repoData.stargazers_count || 0;
    }

    return {
      // Mock data for illustration
      totalCommits: 3,
      totalIssues: 4,
      totalPRs: 2,
      totalStars: 2002,
      // Real data
      totalRepos: userData.public_repos,
      followers: userData.followers,
      publicRepos: userData.public_repos,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

const GitHubStats = () => {
  const [stats, setStats] = createSignal<{
    totalRepos: number;
    totalCommits: number;
    totalIssues: number;
    totalPRs: number;
    totalStars: number;
    followers: number;
    publicRepos: number;
  } | null>(null);

  createEffect(async () => {
    const stats = await getGitHubStats("paulpietzko");
    setStats(stats);
  });

  return (
    <div>
      {stats() ? (
        <div>
          <div>
            {/* showcase all the different languages used and percentages */}

            {/* end */}

            {/* Bar chart with commits in the last year (amount) */}

            {/* end */}

            {/* Should be a Pie Chart with percentages */}
            <p>Total Commits: {stats()?.totalCommits}</p>
            <p>Total Issues: {stats()?.totalIssues}</p>
            <p>Total Pull Requests: {stats()?.totalPRs}</p>
            {/* end */}
          </div>
          <div>
            <p>Followers: {stats()?.followers}</p>
            <p>Public Repositories: {stats()?.publicRepos}</p>
            <p>Total Stars: {stats()?.totalStars}</p>
          </div>
        </div>
      ) : (
        <p>Error loading data or no data available.</p>
      )}
    </div>
  );
};

export default GitHubStats;
