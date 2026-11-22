import SettingsIcon from "@expo/material-symbols/settings.xml";
import { Host, Switch } from "@expo/ui";
import { Icon as ComposeIcon, IconButton } from "@expo/ui/jetpack-compose";
import { router, useNavigation, type ExperimentalStackNavigationProp } from "expo-router";
import { useLayoutEffect, useRef, useState, type ComponentRef } from "react";
import { Button, ScrollView, StyleSheet, View } from "react-native";

import { useSessionData } from "@/api/LiveSessionProvider";
import type { SeasonSession } from "@/api/protocol";
import { nextRound, resolveSelection, RESULT_KEYS, type SessionSelection } from "@/api/season";
import { LiveCard } from "@/components/LiveCard";
import { ResultsCard } from "@/components/ResultsCard";
import { toConstructorStandingEntries, toDriverStandingEntries } from "@/components/standings";
import { StandingsCard } from "@/components/StandingsCard";
import { AppText } from "@/components/ui";
import { WeekendCard } from "@/components/WeekendCard";
import { usePreferences } from "@/preferences/PreferencesProvider";
import { spacing, useTheme } from "@/theme";

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
  // applies the inset on mount, has the resting offset (e.g. -116). Only events the user didn't drive
  // count (`responderIgnoreScroll`, set on iOS while no drag or fling is running), so a drag that wins
  // the race can't be taken for it. Android has no inset: its offsets start at 0, so anything above 0
  // (or no event at all) means 0.
  const restOffset = useRef<number | null>(null);

  // A schedule link selects its session in the Results card and scrolls the card into view.
  const showResults = (session: SeasonSession["type"]) => {
    if (!round) return;
    setSelection({ round: round.round, session });
    scroll.current?.scrollTo({ y: resultsY.current + (restOffset.current ?? 0) - spacing.lg, animated: true });
  };

  const openSettings = () => router.push("/settings");
  const openStandings = (kind: "drivers" | "constructors") =>
    router.push({ pathname: "/standings/[kind]", params: { kind } });
  const openResults = ({ round, session }: SessionSelection) =>
    router.push({
      pathname: "/results/[round]/[session]",
      params: { round: String(round), session: RESULT_KEYS[session] },
    });

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
      onScroll={({ nativeEvent }) => {
        if (nativeEvent.responderIgnoreScroll === true) restOffset.current ??= Math.min(0, nativeEvent.contentOffset.y);
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
                onShowAll={() => openResults(resultsSelection)}
              />
            </View>
          ) : null}
          <StandingsCard
            title="Driver standings"
            entries={toDriverStandingEntries(season, colors.textTertiary)}
            favouriteId={favouriteDriverCode ?? undefined}
            revealLabel="Reveal driver standings"
            onShowAll={() => openStandings("drivers")}
            showAllLabel="Full driver standings"
          />
          <StandingsCard
            title="Constructor standings"
            entries={toConstructorStandingEntries(season, colors.textTertiary)}
            revealLabel="Reveal constructor standings"
            onShowAll={() => openStandings("constructors")}
            showAllLabel="Full constructor standings"
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
});
