import CloseIcon from "@expo/material-symbols/close.xml";
import { Button, Host } from "@expo/ui";
import { Icon, IconButton, Text, TopAppBar } from "@expo/ui/jetpack-compose";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Stack } from "react-native-screens";

import type { ClientMessage, Gap, SessionDetails } from "@/api/protocol";
import type { LiveSession } from "@/api/useLiveSession";
import { AppText, DriverTable, SectionHeader, type DriverTableEntry, type TyreCompound } from "@/components/ui";
import { spacing, useTheme } from "@/theme";

const SYNC_DELAY_MS = 8000;

function formatInterval(gap: Gap, position: number) {
  if (position === 1) return "LEADER";
  if (!gap) return "–";
  if (gap.laps > 0) return `+${gap.laps}L`;
  return gap.ms === null ? "–" : `+${(gap.ms / 1000).toFixed(3)}`;
}

type Props = {
  session: SessionDetails;
  live: LiveSession | null;
  send: (message: ClientMessage) => void;
  onClose: () => void;
};

export function LiveTiming({ session, live, send, onClose }: Props) {
  const { scheme } = useTheme();

  const delayMs = live?.delayMs ?? 0;
  const delayLabel = `+${delayMs / 1000} s`;
  const toggleDelay = () => send({ type: "setDelay", delayMs: delayMs ? 0 : SYNC_DELAY_MS });
  const entries: DriverTableEntry[] = session.drivers
    .flatMap((driver) => {
      const state = live?.state.drivers[driver.number];
      if (!state?.position) return [];
      const compound = state.tyre?.compound;
      return {
        position: state.position,
        code: driver.code,
        teamColor: `#${driver.teamColour}`,
        value: formatInterval(state.interval, state.position),
        tyre: compound && compound !== "UNKNOWN" ? (compound as TyreCompound) : undefined,
      };
    })
    .sort((a, b) => a.position - b.position);

  const Content = (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      {live ? (
        <AppText variant="callout" color="textSecondary">
          {`${session.name} · Lap ${live.state.lap}/${live.state.totalLaps} · ${delayMs ? `${delayMs / 1000} s behind live` : "live"}`}
        </AppText>
      ) : null}
      <SectionHeader title="Timing" subtitle="Interval to car ahead" />
      <DriverTable entries={entries} />
    </ScrollView>
  );

  // A Stack nested in a FormSheet crashes on Android (react-native-screens looks for a ReactRootView parent).
  if (Platform.OS === "android") {
    return (
      <View style={styles.container}>
        <Host matchContents={{ vertical: true }} colorScheme={scheme}>
          <TopAppBar windowInsets={{}}>
            <TopAppBar.NavigationIcon>
              <IconButton onClick={onClose}>
                <Icon source={CloseIcon} contentDescription="Close" />
              </IconButton>
            </TopAppBar.NavigationIcon>
            <TopAppBar.Title>
              <Text>{session.meeting}</Text>
            </TopAppBar.Title>
            <TopAppBar.Actions>
              <Button label={delayLabel} variant="outlined" onPress={toggleDelay} />
            </TopAppBar.Actions>
          </TopAppBar>
        </Host>
        {Content}
      </View>
    );
  }

  return (
    <Stack.Host>
      <Stack.Screen screenKey="live" activityMode="attached">
        {Content}
        <Stack.HeaderConfig
          title={session.meeting}
          ios={{
            leadingItems: [
              {
                id: "close",
                type: "item",
                title: "Close",
                icon: { type: "sfSymbol", name: "chevron.down" },
                onPress: onClose,
              },
            ],
            trailingItems: [{ id: "delay", type: "item", title: delayLabel, onPress: toggleDelay }],
          }}
        />
      </Stack.Screen>
    </Stack.Host>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});
