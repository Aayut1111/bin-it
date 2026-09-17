// Badge definitions. `test(stats)` receives { totalActions, bestStreak, currentStreak }
// and returns true once the badge is earned. Order doubles as display order.
export const BADGES = [
  {
    id: "first-step",
    label: "First Step",
    description: "Log your first civic action.",
    test: (stats) => stats.totalActions >= 1,
  },
  {
    id: "getting-started",
    label: "Getting Started",
    description: "Log 10 civic actions.",
    test: (stats) => stats.totalActions >= 10,
  },
  {
    id: "community-hero",
    label: "Community Hero",
    description: "Log 50 civic actions.",
    test: (stats) => stats.totalActions >= 50,
  },
  {
    id: "civic-champion",
    label: "Civic Champion",
    description: "Log 100 civic actions.",
    test: (stats) => stats.totalActions >= 100,
  },
  {
    id: "streak-3",
    label: "3-Day Streak",
    description: "Log an action 3 days in a row.",
    test: (stats) => stats.bestStreak >= 3,
  },
  {
    id: "streak-7",
    label: "Consistent Citizen",
    description: "Log an action 7 days in a row.",
    test: (stats) => stats.bestStreak >= 7,
  },
  {
    id: "streak-30",
    label: "Civic Habit",
    description: "Log an action 30 days in a row.",
    test: (stats) => stats.bestStreak >= 30,
  },
];