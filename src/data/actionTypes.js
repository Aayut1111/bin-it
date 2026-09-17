// Every loggable civic action. `points` feeds the running impact count.
// `icon` is a small inline-SVG line-art icon (currentColor) matching the
// icon style used elsewhere in the app.
export const ACTION_TYPES = [
  {
    id: "litter-pickup",
    label: "Picked Up Litter",
    description: "Picked up trash you saw lying around, yours or not.",
    points: 2,
    icon: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 40 L38 85 L62 85 L70 40 Z"/>
      <path d="M26 40 L74 40"/>
      <path d="M42 40 L42 24 L58 24 L58 40"/>
      <path d="M42 55 L58 68"/>
      <path d="M58 55 L42 68"/>
    </svg>`,
  },
  {
    id: "used-bin",
    label: "Used a Dustbin",
    description: "Walked the extra steps to bin it instead of dropping it.",
    points: 1,
    icon: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 32 L34 88 Q35 92 40 92 L60 92 Q65 92 66 88 L72 32"/>
      <path d="M22 32 L78 32"/>
      <path d="M40 32 L42 18 L58 18 L60 32"/>
      <path d="M42 45 L44 78"/>
      <path d="M58 45 L56 78"/>
      <path d="M14 18 L30 10"/>
      <circle cx="30" cy="10" r="4"/>
    </svg>`,
  },
  {
    id: "reported-spot",
    label: "Reported a Dumping Spot",
    description: "Flagged an illegal dumping or overflow spot to get it cleaned up.",
    points: 3,
    icon: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 92 C50 92 76 62 76 40 C76 26 64 15 50 15 C36 15 24 26 24 40 C24 62 50 92 50 92 Z"/>
      <circle cx="50" cy="40" r="10"/>
    </svg>`,
  },
  {
    id: "reminded-someone",
    label: "Reminded Someone",
    description: "Spoke up and asked someone not to litter, kindly.",
    points: 2,
    icon: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 30 Q15 20 25 20 L75 20 Q85 20 85 30 L85 55 Q85 65 75 65 L40 65 L22 82 L26 65 L25 65 Q15 65 15 55 Z"/>
      <circle cx="38" cy="42" r="3.5" fill="currentColor" stroke="none"/>
      <circle cx="50" cy="42" r="3.5" fill="currentColor" stroke="none"/>
      <circle cx="62" cy="42" r="3.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
];

export function getActionType(id) {
  return ACTION_TYPES.find((a) => a.id === id) || null;
}