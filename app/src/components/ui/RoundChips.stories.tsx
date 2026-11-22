import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";

import { Card } from "./Card";
import { RoundChips } from "./RoundChips";

const ROUNDS = [
  { round: 9, code: "HAR", name: "Harbour Grand Prix" },
  { round: 10, code: "PIN", name: "Pinewood Grand Prix" },
  { round: 11, code: "MAR", name: "Marisol Grand Prix" },
  { round: 12, code: "SOL", name: "Solano Grand Prix" },
  { round: 13, code: null, name: "Cranford Grand Prix" },
  { round: 14, code: "GLE", name: "Glenmoor Grand Prix" },
  { round: 15, code: "FJO", name: "Fjordhavn Grand Prix" },
];

const meta = {
  title: "UI/RoundChips",
  component: RoundChips,
  args: { rounds: ROUNDS, selectedRound: 14, onSelect: () => {} },
  render: function Render(args) {
    const [selectedRound, setSelectedRound] = useState(args.selectedRound);
    return <RoundChips {...args} selectedRound={selectedRound} onSelect={setSelectedRound} />;
  },
  decorators: [
    (Story) => (
      <Card>
        <Story />
      </Card>
    ),
  ],
} satisfies Meta<typeof RoundChips>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FirstRoundSelected: Story = { args: { selectedRound: 9 } };
