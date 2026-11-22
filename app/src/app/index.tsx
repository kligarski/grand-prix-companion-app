import SettingsIcon from "@expo/material-symbols/settings.xml";
import { Button as UIButton, Host, Switch } from "@expo/ui";
import { Button as ComposeButton, Icon, IconButton, Text } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { Button as SwiftUIButton, Text as SwiftUIText } from "@expo/ui/swift-ui";
import { buttonStyle, controlSize, frame, tint } from "@expo/ui/swift-ui/modifiers";
import { router, useNavigation, type ExperimentalStackNavigationProp } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { Button, Platform, ScrollView, StyleSheet, View } from "react-native";

import { useLive, useSessionData } from "@/api/LiveSessionProvider";
import type { TrackStatus } from "@/api/protocol";
import { nextRound } from "@/api/season";
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

/**
 * The live session card, or "Can't reach the server" when a fetch or the socket failed. A separate
 * component so only it re-renders on every live update, not the whole dashboard.
 */
function LiveCard() {
  const { scheme } = useTheme();
  const { session, sessionError, seasonError, loading, reload } = useSessionData();
  const { status, live, reconnect } = useLive();
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

  const liveSummary = live
    ? [session.name, `Lap ${live.state.lap} of ${live.state.totalLaps}`, TRACK_STATUS[live.state.trackStatus]]
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

export default function Dashboard() {
  const { scheme, colors } = useTheme();
  const navigation = useNavigation<ExperimentalStackNavigationProp<ReactNavigation.RootParamList>>();
  const [spoilers, setSpoilers] = useState(true);
  const { season } = useSessionData();
  const round = season ? nextRound(season) : null;

  const openSettings = () => router.push("/settings");

  const SpoilersSwitch = (
    <View style={styles.spoilers}>
      <Host matchContents colorScheme={scheme}>
        <Switch label="Spoilers" value={spoilers} onValueChange={setSpoilers} />
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
