import { useNavigation, type ExperimentalStackNavigationProp } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import type { Gap, SessionDetails } from "@/api/protocol";
import { SERVER_URL, SESSION_ID } from "@/api/server";
import { useLiveSession } from "@/api/useLiveSession";
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
  const [session, setSession] = useState<SessionDetails | null>(null);
  const { live } = useLiveSession(SESSION_ID, { autoConnect: true });

  useEffect(() => {
    fetch(`${SERVER_URL}/sessions/${SESSION_ID}`)
      .then((response) => response.json())
      .then(setSession);
  }, []);

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
