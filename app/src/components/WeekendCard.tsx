import { Pressable, StyleSheet, View } from "react-native";

import { useLive } from "@/api/LiveSessionProvider";
import type { Round, Season, SeasonSession, SessionStatus } from "@/api/protocol";
import { formatSessionTime, SESSION_LABELS, sessionsWithResults } from "@/api/season";
import type { LiveStatus } from "@/api/useLiveSession";
import { AppText, Card, Icon, SectionHeader, WeekendSchedule, type WeekendSession } from "@/components/ui";
import { spacing } from "@/theme";

/** The session the server replays. Earlier sessions of the weekend are over. */
const LIVE_SESSION_TYPE: SeasonSession["type"] = "Race";

/**
 * The replayed session's row status. "live" only while the socket is open, so the schedule doesn't
 * say LIVE next to "Can't reach the server". "finished" is kept from the last known state even if the
 * socket has dropped since.
 */
function liveSessionStatus(
  socketStatus: LiveStatus,
  sessionStatus: SessionStatus | undefined,
): WeekendSession["status"] {
  if (sessionStatus === "finished" || sessionStatus === "finalised") return "finished";
  if (sessionStatus === "started" && socketStatus === "open") return "live";
  return undefined;
}

/** "Results ›" on a schedule row. It only selects the session in the Results card, so it shows with spoilers off too. */
function ResultsLink({ session, onPress }: { session: SeasonSession["type"]; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${SESSION_LABELS[session]} results`}
      onPress={onPress}
      hitSlop={spacing.sm}
      style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
    >
      <AppText variant="callout" color="link">
        Results
      </AppText>
      <Icon name="chevronRight" size={14} color="link" />
    </Pressable>
  );
}

type Props = {
  round: Round;
  season: Season;
  onShowResults: (session: SeasonSession["type"]) => void;
};

/**
 * This weekend's sessions in the device's time zone. Sessions before the replayed one are finished;
 * the replayed one follows the live socket. Sessions with results link to them. It reads the live
 * state itself, like `LiveCard`, so live updates don't re-render the whole dashboard.
 */
export function WeekendCard({ round, season, onShowResults }: Props) {
  const { status, live } = useLive();
  const liveStatus = liveSessionStatus(status, live?.state.sessionStatus);
  const liveIndex = round.sessions.findIndex((session) => session.type === LIVE_SESSION_TYPE);
  const withResults = sessionsWithResults(season, round.round);

  const sessions = round.sessions.map(
    (session, index): WeekendSession => ({
      key: session.type,
      title: SESSION_LABELS[session.type],
      subtitle: formatSessionTime(session.startUtc),
      status: index < liveIndex ? "finished" : index === liveIndex ? liveStatus : undefined,
      trailing: withResults.includes(session.type) ? (
        <ResultsLink session={session.type} onPress={() => onShowResults(session.type)} />
      ) : undefined,
    }),
  );

  return (
    <View style={styles.section}>
      <SectionHeader title="This weekend" accessory="Times in your time zone" />
      <Card>
        <WeekendSchedule sessions={sessions} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  linkPressed: {
    opacity: 0.6,
  },
});
