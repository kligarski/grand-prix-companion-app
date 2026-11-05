import { SymbolView, type SymbolViewProps } from "expo-symbols";

import { useTheme } from "@/theme";

import type { TextColor } from "./AppText";

const icons = {
  back: { ios: "chevron.left", android: "arrow_back_ios_new", web: "arrow_back_ios_new" },
  calendar: { ios: "calendar", android: "calendar_today", web: "calendar_today" },
  check: { ios: "checkmark", android: "check", web: "check" },
  chevronDown: { ios: "chevron.down", android: "expand_more", web: "expand_more" },
  chevronRight: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
  clock: { ios: "clock", android: "schedule", web: "schedule" },
  close: { ios: "xmark", android: "close", web: "close" },
  search: { ios: "magnifyingglass", android: "search", web: "search" },
  settings: { ios: "gearshape", android: "settings", web: "settings" },
  sliders: { ios: "slider.horizontal.3", android: "tune", web: "tune" },
  sparkles: { ios: "sparkles", android: "auto_awesome", web: "auto_awesome" },
  swap: { ios: "arrow.left.arrow.right", android: "swap_horiz", web: "swap_horiz" },
} satisfies Record<string, SymbolViewProps["name"]>;

export type IconName = keyof typeof icons;

export const iconNames = Object.keys(icons) as IconName[];

type Props = {
  name: IconName;
  size?: number;
  color?: TextColor;
};

export function Icon({ name, size = 20, color = "text" }: Props) {
  const { colors } = useTheme();
  return <SymbolView name={icons[name]} size={size} tintColor={colors[color]} />;
}
