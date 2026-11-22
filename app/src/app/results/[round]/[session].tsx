import { useLocalSearchParams } from "expo-router";

import { useSessionData } from "@/api/LiveSessionProvider";
import { sessionForResultKey, sessionResults, SESSION_LABELS } from "@/api/season";
import { FullListScreen } from "@/components/FullListScreen";
import { toResultTableEntries } from "@/components/results";
import { ScreenMessage, SeasonPendingMessage } from "@/components/ScreenMessage";
import { DriverTable } from "@/components/ui";
import { useScreenHeader } from "@/hooks/useScreenHeader";
import { usePreferences } from "@/preferences/PreferencesProvider";
import { useTheme } from "@/theme";

/**
 * Every row of a session's results, pushed from the Results card's "Full results" link. `round` is
 * the round number and `session` a `RoundResults` key, e.g. `/results/10/qualifying`. The link only
 * shows once the card is revealed, so this screen shows the results regardless of the Spoilers switch.
 */
export default function FullResults() {
  const params = useLocalSearchParams<{ round: string; session: string }>();
  const { season } = useSessionData();
  const { favouriteDriverCode } = usePreferences();
  const { colors } = useTheme();

  const roundNumber = Number(params.round);
  const session = sessionForResultKey(params.session);
  const round = season?.schedule.find((entry) => entry.round === roundNumber);
  const results = season && round && session ? sessionResults(season, { round: round.round, session }) : null;

  useScreenHeader({
    title: round?.name ?? "Results",
    subtitle: round && session ? SESSION_LABELS[session] : undefined,
  });

  if (!season) return <SeasonPendingMessage errorMessage="Can't load the results" />;
  if (!results) return <ScreenMessage message="No results for this session" />;

  return (
    <FullListScreen>
      <DriverTable
        entries={toResultTableEntries(results, colors.textTertiary)}
        favouriteCode={favouriteDriverCode ?? undefined}
        showNames
      />
    </FullListScreen>
  );
}
