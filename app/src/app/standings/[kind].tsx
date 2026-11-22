import { useLocalSearchParams, useNavigation, type ExperimentalStackNavigationProp } from "expo-router";
import { useLayoutEffect } from "react";

import { useSessionData } from "@/api/LiveSessionProvider";
import type { Season } from "@/api/protocol";
import { FullListScreen } from "@/components/FullListScreen";
import { ScreenMessage } from "@/components/ScreenMessage";
import { toConstructorStandingEntries, toDriverStandingEntries } from "@/components/standings";
import { StandingsTable } from "@/components/ui";
import { usePreferences } from "@/preferences/PreferencesProvider";
import { useTheme } from "@/theme";

const TITLES = { drivers: "Driver standings", constructors: "Constructor standings" } as const;

type Kind = keyof typeof TITLES;

function isKind(kind: string | undefined): kind is Kind {
  return kind === "drivers" || kind === "constructors";
}

/** "After round 9 · British Grand Prix": the round the standings were last updated after. */
function asOfLabel(season: Season): string {
  const round = season.schedule.find((entry) => entry.round === season.asOfRound);
  return [`After round ${season.asOfRound}`, round?.name].filter(Boolean).join(" · ");
}

/**
 * A whole championship, pushed from a standings card's "Full standings" link. The link only shows once
 * the card is revealed, so this screen shows the standings regardless of the Spoilers switch.
 */
export default function FullStandings() {
  const navigation = useNavigation<ExperimentalStackNavigationProp<ReactNavigation.RootParamList>>();
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const { season, seasonError } = useSessionData();
  const { favouriteDriverCode } = usePreferences();
  const { colors } = useTheme();
  const valid = isKind(kind);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: valid ? TITLES[kind] : "Standings",
      unstable_headerConfig: { subtitle: valid && season ? asOfLabel(season) : undefined },
    });
  });

  if (!valid) return <ScreenMessage message="Not found" />;
  if (!season) return seasonError ? <ScreenMessage message="Can't load the standings" /> : null;

  const entries =
    kind === "drivers"
      ? toDriverStandingEntries(season, colors.textTertiary)
      : toConstructorStandingEntries(season, colors.textTertiary);

  return (
    <FullListScreen>
      <StandingsTable
        entries={entries}
        // As on the dashboard, only the driver standings highlight the favourite.
        favouriteId={kind === "drivers" ? (favouriteDriverCode ?? undefined) : undefined}
      />
    </FullListScreen>
  );
}
