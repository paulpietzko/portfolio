import { createSignal, createEffect } from "solid-js";
import Chart from "chart.js/auto";

async function getGitHubStats(username: string) {
  try {
    const userResponse = await fetch(
      `https://paulpietzko.vercel.app/api/github/user.json`
    );
    const userData = await userResponse.json();

    const reposResponse = await fetch(
      `https://paulpietzko.vercel.app/api/github/repos.json`
    );
    const repos = await reposResponse.json();

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
      totalCommits: 3,
      totalIssues: 4,
      totalPRs: 2,
      totalStars: 5,
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

  createEffect(() => {
    if (stats()) {
      const ctx = document.getElementById("myChart") as HTMLCanvasElement;
      if (ctx) {
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Commits", "Issues", "Pull Requests", "Stars"],
            datasets: [
              {
                label: "GitHub Stats",
                data: [
                  stats()?.totalCommits,
                  stats()?.totalIssues,
                  stats()?.totalPRs,
                  stats()?.totalStars,
                ],
                backgroundColor: [
                  "rgba(75, 192, 192, 0.2)",
                  "rgba(153, 102, 255, 0.2)",
                  "rgba(255, 159, 64, 0.2)",
                  "rgba(255, 99, 132, 0.2)",
                ],
                borderColor: [
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                  "rgba(255, 159, 64, 1)",
                  "rgba(255, 99, 132, 1)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
  });

  return (
    <div>
      {stats() ? (
        <div>
          <div class="max-w-[30rem]">
            <canvas id="myChart" />
          </div>
          <div>
            <p>Total Commits: {stats()?.totalCommits}</p>
            <p>Total Issues: {stats()?.totalIssues}</p>
            <p>Total Pull Requests: {stats()?.totalPRs}</p>
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
