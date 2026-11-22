import { AppText, Card, StandingsTable, type StandingsTableEntry } from "@/components/ui";

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
  const { hidden, reveal } = useSpoilerReveal();

  return (
    <Card>
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      <SpoilerBlur hidden={hidden} onReveal={reveal} revealLabel={revealLabel}>
        <StandingsTable entries={entries} favouriteId={favouriteId} limit={3} />
      </SpoilerBlur>
    </Card>
  );
}
