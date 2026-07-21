//
// Built-in, read-only style presets shown in the toolbar's "system" style tab.
// Migrated out of PreviewStyleCarouselComponent's former makeRandomStyles():
// the same palette, but deterministic (fixed per entry) instead of re-randomized
// on every toolbar load.
//
const fontTypes = ["Vernada", "Serif", "Arial", "Roboto", "Nunito Sans"];

const backgroundColors = [
  "#FFD700", // Gold
  "#87CEEB", // Sky Blue
  "#90EE90", // Light Green
  "#FFB6C1", // Light Pink
  "#FFA07A", // Light Salmon
  "#9370DB", // Medium Purple
  "#F0E68C", // Khaki
  "#00CED1", // Dark Turquoise
  "#F5DEB3", // Wheat
  "#DDA0DD", // Plum
  "#A9A9A9", // Dark Gray
  "#40E0D0", // Turquoise
];

const fontColors = [
  "#5A4100", // for #FFD700 (Gold) - deep brown
  "#084C61", // for #87CEEB (Sky Blue) - steel blue
  "#14532D", // for #90EE90 (Light Green) - forest green
  "#A00040", // for #FFB6C1 (Light Pink) - deep rose
  "#7B2D00", // for #FFA07A (Light Salmon) - brick orange
  "#E6D6FF", // for #9370DB (Medium Purple) - soft lilac
  "#665C00", // for #F0E68C (Khaki) - mustard olive
  "#004F59", // for #00CED1 (Dark Turquoise) - ocean teal
  "#6B4E16", // for #F5DEB3 (Wheat) - earthy brown
  "#5E3366", // for #DDA0DD (Plum) - muted violet
  "#F0F0F0", // for #A9A9A9 (Dark Gray) - light silver gray
  "#005A63", // for #40E0D0 (Turquoise) - cool navy
];

const defaultSystemStyles = Array.from({ length: 12 }, (_, i) => ({
  id: `system-${i + 1}`,
  connector: {
    text: "Label",
    "font-family": "Arial",
    "font-size": `${12 + i}px`,
    "font-color": fontColors[(i + 6) % 12],
    "font-bg": "#ffffff",
    bold: false,
    italic: false,
    underline: false,
    color: backgroundColors[(i + 6) % 12],
    "line-width": 1 + (i % 4),
  },
  element: {
    text: "Box",
    "font-family": fontTypes[i % fontTypes.length],
    "font-size": `${10 + ((2 * i) % 10)}px`,
    "font-color": fontColors[i % 12],
    color: backgroundColors[i % 12],
    bold: false,
    italic: false,
    underline: false,
  },
}));

export { defaultSystemStyles };
