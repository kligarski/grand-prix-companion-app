import SettingsIcon from "@expo/material-symbols/settings.xml";
import { Button as UIButton, Host, Switch } from "@expo/ui";
import { Button as ComposeButton, Icon as ComposeIcon, IconButton, Text } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { Button as SwiftUIButton, Text as SwiftUIText } from "@expo/ui/swift-ui";
import { buttonStyle, controlSize, frame, tint } from "@expo/ui/swift-ui/modifiers";
import { router, useNavigation, type ExperimentalStackNavigationProp } from "expo-router";
import { useLayoutEffect, useRef, useState, type ComponentRef } from "react";
import { Button, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { useLive, useSessionData } from "@/api/LiveSessionProvider";
import type { Round, Season, SeasonSession, SessionStatus, TrackStatus } from "@/api/protocol";
import {
  formatSessionTime,
  nextRound,
  resolveSelection,
  SESSION_LABELS,
  sessionsWithResults,
  type SessionSelection,
} from "@/api/season";
import type { LiveStatus } from "@/api/useLiveSession";
import { toConstructorStandingEntries, toDriverStandingEntries } from "@/components/standings";
import { ResultsCard } from "@/components/ResultsCard";
import { StandingsCard } from "@/components/StandingsCard";
import {
  AppText,
  Card,
  Icon,
  LiveBadge,
  SectionHeader,
  WeekendSchedule,
  type WeekendSession,
} from "@/components/ui";
import { usePreferences } from "@/preferences/PreferencesProvider";
import { palette, spacing, useTheme } from "@/theme";

const TRACK_STATUS: Record<TrackStatus, string | null> = {
  green: null,
  yellow: "Yellow flag",
  sc: "Safety car",
  vsc: "Virtual safety car",
  vscEnding: "Virtual safety car ending",
  red: "Red flag",
};

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

/** The badge at the top of the live card: red only while the session runs. */
function LiveCardBadge({ sessionStatus }: { sessionStatus: SessionStatus | undefined }) {
  switch (sessionStatus) {
    case "started":
      return <LiveBadge label="LIVE NOW" />;
    case "finished":
    case "finalised":
      return <LiveBadge label="FINISHED" tone="neutral" />;
    case "inactive":
      return <LiveBadge label="STARTING SOON" tone="neutral" />;
    default:
      return null;
  }
}

/**
 * The live session card, or "Can't reach the server" when a fetch or the socket failed. A separate
 * component so only it re-renders on every live update, not the whole dashboard.
 */
function LiveCard() {
  const { scheme } = useTheme();
  const { session, sessionError, seasonError, loading, reload } = useSessionData();
  const { status, live, reconnect } = useLive();
  const { showSpoilers } = usePreferences();
  const fetchFailed = sessionError !== null || seasonError !== null;
  const socketFailed = status === "closed" || status === "error";

  const openLiveTiming = () => router.push("/live");
  const retry = () => {
    if (fetchFailed) reload();
    if (status !== "open") reconnect();
  };

  if (fetchFailed || socketFailed) {
    return (
      <Card>
        <View>
          <AppText variant="title">{"Can't reach the server"}</AppText>
          <AppText variant="callout" color="textSecondary">
            Check your connection and try again.
          </AppText>
        </View>
        <Host matchContents colorScheme={scheme}>
          <UIButton label="Retry" variant="outlined" disabled={loading} onPress={retry} />
        </Host>
      </Card>
    );
  }

  if (!session) return null;

  // The track status gives away incidents, so it's a spoiler; the lap isn't.
  const liveSummary = live
    ? [
        session.name,
        `Lap ${live.state.lap} of ${live.state.totalLaps}`,
        showSpoilers ? TRACK_STATUS[live.state.trackStatus] : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <Card>
      <LiveCardBadge sessionStatus={live?.state.sessionStatus} />
      <View>
        <AppText variant="title">{session.meeting}</AppText>
        {liveSummary ? (
          <AppText variant="callout" color="textSecondary">
            {liveSummary}
          </AppText>
        ) : null}
      </View>
      <Host matchContents={{ vertical: true }} colorScheme={scheme}>
        {Platform.OS === "ios" ? (
          <SwiftUIButton
            onPress={openLiveTiming}
            modifiers={[buttonStyle("borderedProminent"), controlSize("large"), tint(palette.brand)]}
          >
            <SwiftUIText modifiers={[frame({ maxWidth: Infinity })]}>Watch live timing</SwiftUIText>
          </SwiftUIButton>
        ) : (
          <ComposeButton
            onClick={openLiveTiming}
            colors={{ containerColor: palette.brand, contentColor: palette.white }}
            modifiers={[fillMaxWidth()]}
          >
            <Text>Watch live timing</Text>
          </ComposeButton>
        )}
      </Host>
    </Card>
  );
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

type WeekendCardProps = {
  round: Round;
  season: Season;
  onShowResults: (session: SeasonSession["type"]) => void;
};

/**
 * This weekend's sessions in the device's time zone. Sessions before the replayed one are finished;
 * the replayed one follows the live socket. Sessions with results link to them. A separate component,
 * like `LiveCard`, because it reads the live state.
 */
function WeekendCard({ round, season, onShowResults }: WeekendCardProps) {
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

export default function Dashboard() {
  const { scheme, colors } = useTheme();
  const navigation = useNavigation<ExperimentalStackNavigationProp<ReactNavigation.RootParamList>>();
  const { showSpoilers, setShowSpoilers, favouriteDriverCode } = usePreferences();
  const { season } = useSessionData();
  const round = season ? nextRound(season) : null;
  const [selection, setSelection] = useState<SessionSelection | null>(null);
  const resultsSelection = season ? resolveSelection(season, selection) : null;
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const resultsY = useRef(0);
  // iOS lays the content out under the header and insets it (`adjustedContentInset`, which React
  // Native doesn't report), so offset 0 is behind the header. The first scroll event, sent when iOS
  // applies the inset on mount, has the resting offset (e.g. -116). Android has no inset: its first
  // event comes from the user, so anything above 0 means 0.
  const restOffset = useRef<number | null>(null);

  // A schedule link selects its session in the Results card and scrolls the card into view.
  const showResults = (session: SeasonSession["type"]) => {
    if (!round) return;
    setSelection({ round: round.round, session });
    scroll.current?.scrollTo({ y: resultsY.current + (restOffset.current ?? 0) - spacing.lg, animated: true });
  };

  const openSettings = () => router.push("/settings");

  const SpoilersSwitch = (
    <View style={styles.spoilers}>
      <Host matchContents colorScheme={scheme}>
        <Switch label="Spoilers" value={showSpoilers} onValueChange={setShowSpoilers} />
      </Host>
    </View>
  );

  const SettingsButton = (
    <Host matchContents colorScheme={scheme}>
      <IconButton onClick={openSettings}>
        <ComposeIcon source={SettingsIcon} contentDescription="Settings" />
      </IconButton>
    </Host>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      unstable_headerConfig: {
        ios: {
          leadingItems: [{ id: "spoilers", type: "item", render: () => SpoilersSwitch }],
          trailingItems: [
            {
              id: "settings",
              type: "item",
              title: "Settings",
              icon: { type: "sfSymbol", name: "gearshape" },
              onPress: openSettings,
            },
          ],
        },
        android: {
          backgroundColor: colors.background,
          scrolledBackgroundColor: colors.background,
          leadingSubview: { render: () => SpoilersSwitch },
          trailingSubview: { render: () => SettingsButton },
        },
      },
    });
  });

  return (
    <ScrollView
      ref={scroll}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      onScroll={(event) => {
        restOffset.current ??= Math.min(0, event.nativeEvent.contentOffset.y);
      }}
    >
      <View>
        <AppText variant="largeTitle" accessibilityRole="header">
          Race Weekend
        </AppText>
        {round ? (
          <AppText variant="callout" color="textSecondary">
            {`Round ${round.round} · ${round.name} · ${round.circuit}`}
          </AppText>
        ) : null}
      </View>
      <LiveCard />
      {round && season ? <WeekendCard round={round} season={season} onShowResults={showResults} /> : null}
      {season ? (
        <>
          {resultsSelection ? (
            <View onLayout={(event) => (resultsY.current = event.nativeEvent.layout.y)}>
              <ResultsCard
                season={season}
                selection={resultsSelection}
                onSelectionChange={setSelection}
                favouriteCode={favouriteDriverCode ?? undefined}
              />
            </View>
          ) : null}
          <StandingsCard
            title="Driver standings"
            entries={toDriverStandingEntries(season, colors.textTertiary)}
            favouriteId={favouriteDriverCode ?? undefined}
            revealLabel="Reveal driver standings"
          />
          <StandingsCard
            title="Constructor standings"
            entries={toConstructorStandingEntries(season, colors.textTertiary)}
            revealLabel="Reveal constructor standings"
          />
        </>
      ) : null}
      {__DEV__ ? <Button title="Storybook" onPress={() => router.push("/storybook")} /> : null}
      {__DEV__ ? <Button title="Server test" onPress={() => router.push("/server-test")} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  spoilers: {
    paddingHorizontal: spacing.md,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
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
