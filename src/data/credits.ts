/**
 * The degree, as the credits section draws it.
 *
 * Edit EARNED after each exam session and IN_PROGRESS at the start of each
 * semester, then redeploy. Everything date-related is derived from `started`,
 * so the calendar side of the section never needs touching.
 */

export const DEGREE = {
  title: "BSc Computer Science",
  school: "ZHAW",
  /** First day of the first semester. */
  started: "2026-09-16",
  /** ECTS credits for the whole bachelor's. */
  total: 180,
  /** Part-time, alongside work — eight semesters instead of six. */
  semesters: 8,
};

/** Credits on the transcript: passed and booked. */
export const EARNED = 0;

/** Credits you're sitting this semester — drawn as pending, not earned. */
export const IN_PROGRESS = 0;

/** What one ECTS credit stands for in Switzerland: 25–30 hours of work. */
export const HOURS_PER_CREDIT = 30;

const DAY = 86_400_000;

/** "16 Sep 2026" — day first, the way the events cards write dates. */
const formatDay = (date: Date) =>
  `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })} ${date.getFullYear()}`;

/**
 * Where today falls in the degree. Shared by the build and the browser: the
 * page is prerendered, so if only the build worked this out, "starts in three
 * days" would stay on the site until the next deploy.
 *
 * `current` is the zero-based semester, -1 before the start and `semesters`
 * once the planned finish has passed.
 */
export const standing = (now: Date) => {
  const start = new Date(`${DEGREE.started}T00:00:00`);
  const until = Math.ceil((start.getTime() - now.getTime()) / DAY);

  if (until > 0) {
    return {
      current: -1,
      label: `Starts ${formatDay(start)} — in ${until} ${until === 1 ? "day" : "days"}`,
    };
  }

  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth()) -
    (now.getDate() < start.getDate() ? 1 : 0);
  const current = Math.floor(months / 6);

  if (current >= DEGREE.semesters) {
    return { current: DEGREE.semesters, label: "Past the planned finish line" };
  }

  const day = Math.floor((now.getTime() - start.getTime()) / DAY) + 1;
  return {
    current,
    label: `Semester ${current + 1} of ${DEGREE.semesters} · day ${day.toLocaleString("en-US")}`,
  };
};

/**
 * ZHAW-style semester names — HS for the autumn term, FS for spring — counted
 * forward in six-month steps from the start.
 */
export const semesterNames = () => {
  const start = new Date(`${DEGREE.started}T12:00:00`);
  return Array.from({ length: DEGREE.semesters }, (_, i) => {
    const term = new Date(start);
    term.setMonth(start.getMonth() + i * 6);
    const autumn = term.getMonth() >= 7;
    return `${autumn ? "HS" : "FS"}${String(term.getFullYear()).slice(2)}`;
  });
};
