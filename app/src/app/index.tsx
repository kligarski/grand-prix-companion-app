import CheckIcon from "@expo/material-symbols/check.xml";
import SettingsIcon from "@expo/material-symbols/settings.xml";
import { Host, Switch } from "@expo/ui";
import { Button as ComposeButton, FilterChip, Icon, IconButton, Row, Text } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { Button as SwiftUIButton, Text as SwiftUIText } from "@expo/ui/swift-ui";
import { buttonStyle, controlSize, frame, tint } from "@expo/ui/swift-ui/modifiers";
import { router, useNavigation, type ExperimentalStackNavigationProp } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { Button, Platform, ScrollView, StyleSheet, View } from "react-native";
import { FormSheet } from "react-native-screens";

import type { Round, Season, SessionDetails, TrackStatus } from "@/api/protocol";
import { SERVER_URL, SESSION_ID } from "@/api/server";
import { useLiveSession } from "@/api/useLiveSession";
import { LiveTiming } from "@/components/LiveTiming";
import { AppText, Card, LiveBadge } from "@/components/ui";
import { palette, spacing, useTheme } from "@/theme";

const TRACK_STATUS: Record<TrackStatus, string | null> = {
  green: null,
  yellow: "Yellow flag",
  sc: "Safety car",
  vsc: "Virtual safety car",
  vscEnding: "Virtual safety car ending",
  red: "Red flag",
};

export default function Dashboard() {
  const { scheme, colors } = useTheme();
  const navigation = useNavigation<ExperimentalStackNavigationProp<ReactNavigation.RootParamList>>();
  const [spoilers, setSpoilers] = useState(true);
  const [round, setRound] = useState<Round | null>(null);
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [liveTimingOpen, setLiveTimingOpen] = useState(false);
  const { live, connect, send } = useLiveSession(SESSION_ID);

  const openSettings = () => router.push("/settings");

  useEffect(() => {
    fetch(`${SERVER_URL}/season`)
      .then((response) => response.json())
      .then((season: Season) => setRound(season.schedule.find((r) => r.round === season.asOfRound + 1) ?? null));
    fetch(`${SERVER_URL}/sessions/${SESSION_ID}`)
      .then((response) => response.json())
      .then(setSession);
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liveSummary = live
    ? [session?.name, `Lap ${live.state.lap} of ${live.state.totalLaps}`, TRACK_STATUS[live.state.trackStatus]]
        .filter(Boolean)
        .join(" · ")
    : null;

  const SpoilersSwitch = (
    <View style={styles.spoilers}>
      <Host matchContents colorScheme={scheme}>
        <Switch label="Spoilers" value={spoilers} onValueChange={setSpoilers} />
      </Host>
    </View>
  );

  const AndroidActions = (
    <Host matchContents colorScheme={scheme}>
      <Row verticalAlignment="center">
        <FilterChip selected={spoilers} onClick={() => setSpoilers(!spoilers)}>
          <FilterChip.LeadingIcon>{spoilers ? <Icon source={CheckIcon} size={18} /> : null}</FilterChip.LeadingIcon>
          <FilterChip.Label>
            <Text>Spoilers</Text>
          </FilterChip.Label>
        </FilterChip>
        <IconButton onClick={openSettings}>
          <Icon source={SettingsIcon} contentDescription="Settings" />
        </IconButton>
      </Row>
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
          trailingSubview: { render: () => AndroidActions },
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
      {session ? (
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
                onPress={() => setLiveTimingOpen(true)}
                modifiers={[buttonStyle("borderedProminent"), controlSize("large"), tint(palette.brand)]}
              >
                <SwiftUIText modifiers={[frame({ maxWidth: Infinity })]}>Watch live timing</SwiftUIText>
              </SwiftUIButton>
            ) : (
              <ComposeButton
                onClick={() => setLiveTimingOpen(true)}
                colors={{ containerColor: palette.brand, contentColor: palette.white }}
                modifiers={[fillMaxWidth()]}
              >
                <Text>Watch live timing</Text>
              </ComposeButton>
            )}
          </Host>
          <FormSheet isOpen={liveTimingOpen} detents={[1]} onNativeDismiss={() => setLiveTimingOpen(false)}>
            <LiveTiming session={session} live={live} send={send} onClose={() => setLiveTimingOpen(false)} />
          </FormSheet>
        </Card>
      ) : null}
      <Button title="Onboarding" onPress={() => router.push("/onboarding")} />
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
});
