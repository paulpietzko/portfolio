// Fetch the user's contributions for the last 12 months using GitHub GraphQL contributionsCollection.
// Returns an array of 12 numbers: index 0 = oldest month (11 months ago), index 11 = current month.

const QUERY = `
query ($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
`;

const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

async function fetchGraphQL(
  query: string,
  variables: Record<string, any>,
  token: string
) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GitHub GraphQL error: ${res.status} ${res.statusText} ${text}`
    );
  }

  const json = await res.json();
  if (json.errors && json.errors.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

const fetchUserCommits = async (username: string): Promise<number[]> => {
  const token = import.meta.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GitHub token is missing. Set GITHUB_TOKEN in your environment."
    );
  }

  const now = new Date();
  const from = new Date(now);
  from.setFullYear(from.getFullYear() - 1);

  // GraphQL expects ISO datetimes
  const variables = {
    login: username,
    from: from.toISOString(),
    to: now.toISOString(),
  };

  const data = await fetchGraphQL(QUERY, variables, token);

  const weeks =
    data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!Array.isArray(weeks)) {
    // Return empty/zeroed buckets on unexpected structure
    return new Array(12).fill(0);
  }

  // Prepare 12-month buckets (index 0 = oldest, index 11 = newest/current)
  const commitsByMonth = new Array(12).fill(0);

  // Flatten days and aggregate
  const days: { date: string; contributionCount: number }[] = [];
  for (const w of weeks) {
    if (!w?.contributionDays) continue;
    for (const d of w.contributionDays) {
      days.push({ date: d.date, contributionCount: d.contributionCount ?? 0 });
    }
  }

  // Map each day to a month bucket relative to `now`
  for (const day of days) {
    const commitDate = new Date(day.date + "T00:00:00Z"); // ensure UTC parse
    const diffInMonths =
      now.getFullYear() * 12 +
      now.getMonth() -
      (commitDate.getFullYear() * 12 + commitDate.getMonth());

    if (diffInMonths >= 0 && diffInMonths < 12) {
      // 11 - diffInMonths => oldest->newest ordering
      commitsByMonth[11 - diffInMonths] += day.contributionCount;
    }
  }

  return commitsByMonth;
};

export default fetchUserCommits;
