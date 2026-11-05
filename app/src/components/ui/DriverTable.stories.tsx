import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";

import { FAVOURITE_CODE, qualifyingResults, raceTiming } from "@/mocks/drivers";

import { DriverTable } from "./DriverTable";
import { SectorSplits } from "./SectorSplits";

const meta = {
  title: "UI/DriverTable",
  component: DriverTable,
  args: {
    entries: qualifyingResults,
    favouriteCode: FAVOURITE_CODE,
    limit: 3,
    showNames: true,
  },
} satisfies Meta<typeof DriverTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ResultsCard: Story = {};

export const FullResults: Story = {
  args: {
    limit: undefined,
  },
};

export const NoFavourite: Story = {
  args: {
    favouriteCode: undefined,
  },
};

export const LiveTiming: Story = {
  args: {
    entries: raceTiming,
    limit: undefined,
    showNames: false,
  },
  render: function LiveTimingStory(args) {
    const [expandedCode, setExpandedCode] = useState<string | undefined>("OKO");

    return (
      <DriverTable
        {...args}
        expandedCode={expandedCode}
        onEntryPress={(entry) => setExpandedCode((current) => (current === entry.code ? undefined : entry.code))}
        renderDetails={() => (
          <SectorSplits
            sectors={[
              { label: "S1 28.114", note: "Personal best", status: "personalBest" },
              { label: "S2 34.902", note: "Session best", status: "sessionBest" },
              { label: "S3 —", note: "Safety car", status: "none" },
            ]}
          />
        )}
      />
    );
  },
};
