/** Fixed accent colours that look the same in light and dark mode. */
export const palette = {
  brand: "#1C3A9A",
  white: "#FFFFFF",
  black: "#000000",

  // Track status / race control
  flagYellow: "#FFC801",
  flagGreen: "#30D158",
  flagRed: "#FF453A",
  investigation: "#FF9F0A",
  drs: "#5BC3ED",
  incident: "#494F5B",

  // Timing: sector / lap colours
  sessionBest: "#BF5AF2",
  personalBest: "#30D158",
  noImprovement: "#FFC801",

  // Tyre compounds
  tyreSoft: "#FF3B30",
  tyreMedium: "#FFC801",
  tyreHard: "#F2F3F5",
  tyreIntermediate: "#30D158",
  tyreWet: "#0A84FF",
} as const;

/**
 * Placeholder team colours. Real data from the F1 feed
 * comes with its own team colour, so components take a colour prop and these
 * are only for mocks and previews.
 */
export const teamColors = {
  aster: "#32ADE6",
  borealis: "#FF9500",
  cobalt: "#5E5CE6",
  dune: "#A2845E",
  ember: "#00C7BE",
  fjord: "#FF375F",
} as const;

export type ColorTokens = {
  /** Screen background */
  background: string;
  /** Cards and grouped sections */
  surface: string;
  /** Rows and tiles placed on a surface */
  surfaceElevated: string;
  /** Bottom sheets and modals */
  sheet: string;
  /** Inputs, pill buttons, segmented control track */
  fill: string;
  /** Selected segment of a segmented control */
  fillSelected: string;
  separator: string;
  border: string;

  text: string;
  textSecondary: string;
  textTertiary: string;

  /** Filled buttons, active chips, position badges */
  primary: string;
  onPrimary: string;
  /** Text links ("Full results", "More details") and section labels */
  link: string;
  live: string;

  /** Inverted surface used to highlight the user's favourite driver */
  highlight: string;
  onHighlight: string;
  onHighlightSecondary: string;
};

export const darkColors: ColorTokens = {
  background: "#000000",
  surface: "#0F1015",
  surfaceElevated: "#1A1D26",
  sheet: "#15161B",
  fill: "#1D1D1F",
  fillSelected: "#57585D",
  separator: "#22252F",
  border: "#393F4D",

  text: "#F2F3F5",
  textSecondary: "#9A9BA1",
  textTertiary: "#66676B",

  primary: palette.brand,
  onPrimary: "#FFFFFF",
  link: "#6E8FFF",
  live: "#FF5A4E",

  highlight: "#FFFFFF",
  onHighlight: "#0B0A0F",
  onHighlightSecondary: "#5E5D63",
};

export const lightColors: ColorTokens = {
  background: "#F3F2F7",
  surface: "#FFFFFF",
  surfaceElevated: "#EEEDF2",
  sheet: "#FFFFFF",
  fill: "#E6E6EB",
  fillSelected: "#FFFFFF",
  separator: "#E3E2E8",
  border: "#C9C8CF",

  text: "#19181D",
  textSecondary: "#6C6B71",
  textTertiary: "#A3A2A8",

  primary: palette.brand,
  onPrimary: "#FFFFFF",
  link: "#1D4ED8",
  live: "#D80015",

  highlight: "#0B0A0F",
  onHighlight: "#FFFFFF",
  onHighlightSecondary: "#A3A2A8",
};
