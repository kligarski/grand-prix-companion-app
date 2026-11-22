import { useNavigation, type ExperimentalStackNavigationProp } from "expo-router";
import { useLayoutEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { useLive, useSessionData } from "@/api/LiveSessionProvider";
import type { Gap } from "@/api/protocol";
import { DriverTable, SectionHeader, type DriverTableEntry, type TyreCompound } from "@/components/ui";
import { spacing } from "@/theme";

function formatInterval(gap: Gap, position: number) {
  if (position === 1) return "LEADER";
  if (!gap) return "–";
  if (gap.laps > 0) return `+${gap.laps}L`;
  return gap.ms === null ? "–" : `+${(gap.ms / 1000).toFixed(3)}`;
}

export default function Live() {
  const navigation = useNavigation<ExperimentalStackNavigationProp<ReactNavigation.RootParamList>>();
  const { session } = useSessionData();
  const { live } = useLive();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: session?.meeting ?? "",
      unstable_headerConfig: {
        subtitle: live && session ? `${session.name} · Lap ${live.state.lap}/${live.state.totalLaps}` : undefined,
      },
    });
  });

  const entries: DriverTableEntry[] = (session?.drivers ?? [])
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

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader title="Timing" subtitle="Interval to car ahead" />
      <DriverTable entries={entries} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});
