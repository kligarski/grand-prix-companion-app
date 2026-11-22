import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { Host, SegmentedButton, SingleChoiceSegmentedButtonRow, Text } from "@expo/ui/jetpack-compose";
import { semantics } from "@expo/ui/jetpack-compose/modifiers";
import { Platform } from "react-native";

import type { Season, SeasonSession } from "@/api/protocol";
import {
  roundsWithResults,
  selectRound,
  sessionResults,
  sessionsWithResults,
  SESSION_LABELS,
  SHORT_SESSION_LABELS,
  type SessionSelection,
} from "@/api/season";
import { AppText, Card, CardLink, DriverTable, RoundChips } from "@/components/ui";
import { palette, useTheme } from "@/theme";

import { toResultTableEntries } from "./results";
import { SpoilerBlur, useSpoilerReveal } from "./SpoilerBlur";

type SessionPickerProps = {
  sessions: readonly SeasonSession["type"][];
  selected: SeasonSession["type"];
  onSelect: (session: SeasonSession["type"]) => void;
};

/**
 * The round's sessions as a native segmented control. iOS keeps the system look (a grey selected
 * segment, as in the design; the brand blue would put black text on it in light mode). Android uses
 * Material segmented buttons with the brand blue and white text, which the community
 * `SegmentedControl` can't set.
 */
function SessionPicker({ sessions, selected, onSelect }: SessionPickerProps) {
  const { scheme, colors } = useTheme();
  const selectedIndex = sessions.indexOf(selected);

  if (Platform.OS === "ios") {
    return (
      <SegmentedControl
        values={sessions.map((session) => SHORT_SESSION_LABELS[session])}
        selectedIndex={selectedIndex}
        onChange={(event) => onSelect(sessions[event.nativeEvent.selectedSegmentIndex])}
        appearance={scheme}
        accessibilityLabel="Session"
      />
    );
  }

  const buttonColors = {
    activeContainerColor: palette.brand,
    activeContentColor: palette.white,
    activeBorderColor: palette.brand,
    inactiveContainerColor: colors.surface,
    inactiveContentColor: colors.text,
    inactiveBorderColor: colors.border,
  };

  return (
    <Host matchContents={{ vertical: true }} colorScheme={scheme}>
      <SingleChoiceSegmentedButtonRow>
        {sessions.map((session) => (
          <SegmentedButton
            key={session}
            selected={session === selected}
            onClick={() => onSelect(session)}
            colors={buttonColors}
            // TalkBack reads "Sprint Qualifying", not "SQ". The iOS control has no per-segment label.
            modifiers={[semantics({ contentDescription: SESSION_LABELS[session] })]}
          >
            <SegmentedButton.Label>
              <Text maxLines={1} softWrap={false}>
                {SHORT_SESSION_LABELS[session]}
              </Text>
            </SegmentedButton.Label>
          </SegmentedButton>
        ))}
      </SingleChoiceSegmentedButtonRow>
    </Host>
  );
}

type Props = {
  season: Season;
  /** A session with results, from `resolveSelection`. */
  selection: SessionSelection;
  onSelectionChange: (selection: SessionSelection) => void;
  favouriteCode?: string;
  /** Opens every row of the selected session. The "Full results" link shows only while the rows aren't hidden. */
  onShowAll?: () => void;
};

/**
 * The top 3 of a session plus the favourite, for any round with results. Blurred when spoilers are
 * off, like the standings; the round and session pickers stay usable.
 */
export function ResultsCard({ season, selection, onSelectionChange, favouriteCode, onShowAll }: Props) {
  const { colors } = useTheme();
  const { hidden, reveal } = useSpoilerReveal();

  const rounds = roundsWithResults(season);
  const sessions = sessionsWithResults(season, selection.round);
  const entries = toResultTableEntries(sessionResults(season, selection) ?? [], colors.textTertiary);
  const roundName = rounds.find((round) => round.round === selection.round)?.name ?? `Round ${selection.round}`;

  // As in `StandingsCard`: blur hides text, not shapes or colour, so while hidden there's no favourite
  // row or highlight and no team colours.
  const blurredEntries = entries.map((entry) => ({ ...entry, teamColor: colors.textTertiary }));

  const changeRound = (round: number) => {
    const next = selectRound(season, round, selection.session);
    if (next) onSelectionChange(next);
  };

  return (
    <Card>
      <AppText variant="title" accessibilityRole="header">
        Results
      </AppText>
      <RoundChips
        rounds={rounds.map((round) => ({ round: round.round, code: round.countryCode ?? null, name: round.name }))}
        selectedRound={selection.round}
        onSelect={changeRound}
      />
      <SessionPicker
        sessions={sessions}
        selected={selection.session}
        onSelect={(session) => onSelectionChange({ round: selection.round, session })}
      />
      <SpoilerBlur
        hidden={hidden}
        onReveal={reveal}
        revealLabel="Reveal results"
        revealedAnnouncement={`${roundName} ${SESSION_LABELS[selection.session]} results revealed`}
      >
        <DriverTable
          entries={hidden ? blurredEntries : entries}
          favouriteCode={hidden ? undefined : favouriteCode}
          limit={3}
          showNames
        />
      </SpoilerBlur>
      {onShowAll && !hidden ? (
        <CardLink
          label="Full results"
          accessibilityLabel={`Full ${roundName} ${SESSION_LABELS[selection.session]} results`}
          onPress={onShowAll}
        />
      ) : null}
    </Card>
  );
}
