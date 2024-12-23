const processCommitData = (events: any[]): number[] => {
  const commitsByMonth = new Array(12).fill(0); // Array to store commit counts for the last 12 months
  const now = new Date();

  events.forEach((event) => {
    if (event.type === "PushEvent") {
      const eventDate = new Date(event.created_at);
      const diffInMonths =
        now.getFullYear() * 12 +
        now.getMonth() -
        (eventDate.getFullYear() * 12 + eventDate.getMonth());

      if (diffInMonths >= 0 && diffInMonths < 12) {
        commitsByMonth[11 - diffInMonths] += event.payload.size; // Update commit count
      }
    }
  });

  return commitsByMonth;
};

export default processCommitData;
