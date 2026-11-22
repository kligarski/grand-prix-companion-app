import type { ReactNode } from "react";
import { View } from "react-native";

import { createThemedStyles, spacing } from "@/theme";

import { AppText } from "./AppText";
import { LiveBadge } from "./LiveBadge";

export type WeekendSession = {
  key: string;
  title: string;
  /** The start time, e.g. "Fri 13:30". The status is appended to it. */
  subtitle: string;
  status?: "finished" | "live";
  /** Trailing content, e.g. a link. A live session shows the LIVE badge when it has none. */
  trailing?: ReactNode;
};

type Props = {
  sessions: readonly WeekendSession[];
};

const STATUS_TEXT = { finished: "finished", live: "now" } as const;

/** The weekend's sessions on a timeline: a dot per session joined by a line. */
export function WeekendSchedule({ sessions }: Props) {
  const styles = useStyles();

  return (
    <View>
      {sessions.map((session, index) => {
        const isLive = session.status === "live";
        const subtitle = session.status ? `${session.subtitle} · ${STATUS_TEXT[session.status]}` : session.subtitle;
        const trailing = session.trailing ?? (isLive ? <LiveBadge /> : null);

        return (
          <View key={session.key} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.line, index === 0 && styles.lineHidden]} />
              {isLive ? (
                <View style={styles.liveRing}>
                  <View style={styles.liveDot} />
                </View>
              ) : (
                <View style={[styles.dot, session.status === "finished" && styles.dotFinished]} />
              )}
              <View style={[styles.line, index === sessions.length - 1 && styles.lineHidden]} />
            </View>
            <View style={styles.titles} accessible accessibilityLabel={`${session.title}, ${subtitle}`}>
              <AppText variant="body">{session.title}</AppText>
              <AppText variant="footnote" color="textSecondary">
                {subtitle}
              </AppText>
            </View>
            {trailing}
          </View>
        );
      })}
    </View>
  );
}

const DOT = 10;
const LIVE_RING = 22;
const LINE = 2;

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rail: {
    alignSelf: "stretch",
    alignItems: "center",
    width: LIVE_RING,
  },
  line: {
    flex: 1,
    width: LINE,
    backgroundColor: colors.border,
  },
  lineHidden: {
    opacity: 0,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: LINE,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dotFinished: {
    backgroundColor: colors.textTertiary,
    borderColor: colors.textTertiary,
  },
  liveRing: {
    width: LIVE_RING,
    height: LIVE_RING,
    borderRadius: LIVE_RING / 2,
    borderWidth: LINE,
    borderColor: colors.live,
    alignItems: "center",
    justifyContent: "center",
  },
  liveDot: {
    width: DOT + spacing.xs,
    height: DOT + spacing.xs,
    borderRadius: (DOT + spacing.xs) / 2,
    backgroundColor: colors.live,
  },
  titles: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
}));
