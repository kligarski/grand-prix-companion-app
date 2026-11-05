import { Platform, type TextStyle } from "react-native";

type DisplayWeight = "500" | "600" | "700";

const IOS_POSTSCRIPT_NAMES: Record<DisplayWeight, string> = {
  "500": "SairaSemiCondensed-Medium",
  "600": "SairaSemiCondensed-SemiBold",
  "700": "SairaSemiCondensed-Bold",
};

export const fonts = {
  display: "Saira SemiCondensed",
} as const;

export function displayFont(weight: DisplayWeight): TextStyle {
  return Platform.select<TextStyle>({
    ios: { fontFamily: IOS_POSTSCRIPT_NAMES[weight] },
    default: { fontFamily: fonts.display, fontWeight: weight },
  });
}

const SAIRA_CAP_HEIGHT = 0.688;
const SAIRA_DESCENT = 0.439;

const iosCapsShift = (fontSize: number, lineHeight: number) =>
  (fontSize * (SAIRA_CAP_HEIGHT + 2 * SAIRA_DESCENT) - lineHeight) / 2;

const display = (fontSize: number, weight: DisplayWeight, lineHeight: number): TextStyle => ({
  ...displayFont(weight),
  fontSize,
  lineHeight,
  ...Platform.select<TextStyle>({
    ios: { transform: [{ translateY: iosCapsShift(fontSize, lineHeight) }] },
    default: {},
  }),
});

export const typography = {
  /** Screen titles: "RACE WEEKEND", "PICK YOUR DRIVER" */
  largeTitle: { ...display(40, "700", 44), textTransform: "uppercase" },
  /** Card titles: "RESULTS", "TIMING", "HARBOUR GP" */
  title: { ...display(24, "700", 28), textTransform: "uppercase" },
  /** Driver codes, positions, intervals */
  headline: display(20, "700", 24),
  /** Small display text: sector times, "LIVE" */
  label: display(15, "600", 18),
  /** Capital letters centred in a round badge (tyre compound). */
  badge: { ...display(13, "600", 20), includeFontPadding: false },
  /** Small uppercase labels: "FAVOURITE DRIVER", "LAP 34 · RACE CONTROL" */
  overline: {
    ...display(13, "700", 16),
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  body: { fontSize: 17, lineHeight: 22 },
  bodyStrong: { fontSize: 17, lineHeight: 22, fontWeight: "600" },
  callout: { fontSize: 15, lineHeight: 20 },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
