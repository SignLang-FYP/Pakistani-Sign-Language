/**
 * The interface is a light, near-monochrome surface. A colour theme only
 * changes the single accent colour used for highlights, active states and
 * primary actions — the page itself stays white and low-stimulus.
 *
 * `id` values are persisted in Firestore, so they must not be renamed.
 */
export const colorThemes = [
  {
    id: "orange",
    name: "Warm Orange",
    description: "Bright and energetic. The original SignLang accent.",
    accent: "#E85D04",
  },
  {
    id: "calmBlue",
    name: "Calm Blue",
    description: "Soft blue for a calm, focused interface.",
    accent: "#2563EB",
  },
  {
    id: "softGreen",
    name: "Soft Green",
    description: "Gentle green for a natural, comfortable look.",
    accent: "#0A8F4C",
  },
  {
    id: "lavender",
    name: "Lavender Comfort",
    description: "Muted purple for a gentle, low-pressure feel.",
    accent: "#7C3AED",
  },
];

export type ColorTheme = (typeof colorThemes)[number];

export const defaultTheme = colorThemes[2];
