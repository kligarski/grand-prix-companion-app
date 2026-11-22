import SettingsIcon from "@expo/material-symbols/settings.xml";
import { Button as UIButton, Host, Switch } from "@expo/ui";
import { Button as ComposeButton, Icon, IconButton, Text } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { Button as SwiftUIButton, Text as SwiftUIText } from "@expo/ui/swift-ui";
import { buttonStyle, controlSize, frame, tint } from "@expo/ui/swift-ui/modifiers";
import { router, useNavigation, type ExperimentalStackNavigationProp } from "expo-router";
import { useLayoutEffect } from "react";
import { Button, Platform, ScrollView, StyleSheet, View } from "react-native";

import { useLive, useSessionData } from "@/api/LiveSessionProvider";
import type { Round, SeasonSession, SessionStatus, TrackStatus } from "@/api/protocol";
import {
  formatSessionTime,
  nextRound,
  SESSION_LABELS,
  toConstructorStandingEntries,
  toDriverStandingEntries,
} from "@/api/season";
import { StandingsCard } from "@/components/StandingsCard";
import { AppText, Card, LiveBadge, SectionHeader, WeekendSchedule, type WeekendSession } from "@/components/ui";
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

function liveSessionStatus(status: SessionStatus | undefined): WeekendSession["status"] {
  if (status === "started") return "live";
  if (status === "finished" || status === "finalised") return "finished";
  return undefined;
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
      <LiveBadge label="LIVE NOW" />
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

/**
 * This weekend's sessions in the device's time zone. Sessions before the replayed one are finished;
 * the replayed one follows the live socket. A separate component, like `LiveCard`, because it reads
 * the live state.
 */
function WeekendCard({ round }: { round: Round }) {
  const { live } = useLive();
  const liveStatus = liveSessionStatus(live?.state.sessionStatus);
  const liveIndex = round.sessions.findIndex((session) => session.type === LIVE_SESSION_TYPE);

  const sessions = round.sessions.map(
    (session, index): WeekendSession => ({
      key: session.type,
      title: SESSION_LABELS[session.type],
      subtitle: formatSessionTime(session.startUtc),
      status: index < liveIndex ? "finished" : index === liveIndex ? liveStatus : undefined,
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
        <Icon source={SettingsIcon} contentDescription="Settings" />
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
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
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
      {round ? <WeekendCard round={round} /> : null}
      {season ? (
        <>
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
});
