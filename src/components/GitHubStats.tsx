import { createSignal, onMount } from 'solid-js';

const GitHubStats = () => {
  const [stats, setStats] = createSignal<{ totalRepos: number; totalLines: number } | null>(null);

  onMount(async () => {
    const username = 'paulpietzko';
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
      const repos = await response.json();
      console.log('Repos:', repos);

      let totalLines = 0;

      for (const repo of repos) {
        const response = await fetch(repo.languages_url);
        const languages = await response.json();
        const repoLines = Object.values(languages).reduce((a, b) => (a as number) + (b as number), 0) as number;
        totalLines += repoLines;
      }

      setStats({
        totalRepos: repos.length,
        totalLines,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  });

  return (
    <div>
      {stats() ? (
        <>
          <p>Total Repositories: {stats()!.totalRepos}</p>
          <p>Total Lines of Code: {stats()!.totalLines}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default GitHubStats;