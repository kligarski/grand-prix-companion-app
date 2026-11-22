import { AppText, Card, StandingsTable, type StandingsTableEntry } from "@/components/ui";
import { useTheme } from "@/theme";

import { SpoilerBlur, useSpoilerReveal } from "./SpoilerBlur";

type Props = {
  title: string;
  entries: readonly StandingsTableEntry[];
  favouriteId?: string;
  /** What screen readers read for the blurred rows, e.g. "Reveal driver standings". */
  revealLabel: string;
};

/** The top 3 of a championship, plus the favourite. Blurred when spoilers are off; the title stays sharp. */
export function StandingsCard({ title, entries, favouriteId, revealLabel }: Props) {
  const { colors } = useTheme();
  const { hidden, reveal } = useSpoilerReveal();

  // Blur hides text but not shapes or colour: an appended favourite row, its highlight band and the
  // team stripes would show where the favourite stands. While hidden, render plain rows only.
  const blurredEntries = entries.map((entry) => ({ ...entry, teamColor: colors.textTertiary }));

  return (
    <Card>
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      <SpoilerBlur
        hidden={hidden}
        onReveal={reveal}
        revealLabel={revealLabel}
        revealedAnnouncement={`${title} revealed`}
      >
        <StandingsTable
          entries={hidden ? blurredEntries : entries}
          favouriteId={hidden ? undefined : favouriteId}
          limit={3}
        />
      </SpoilerBlur>
    </Card>
  );
}
