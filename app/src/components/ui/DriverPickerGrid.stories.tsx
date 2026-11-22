import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { fn } from "storybook/test";

import { FAVOURITE_CODE, pickerDrivers } from "@/mocks/drivers";

import { DriverPickerGrid } from "./DriverPickerGrid";

const meta = {
  title: "UI/DriverPickerGrid",
  component: DriverPickerGrid,
  args: {
    drivers: pickerDrivers,
    selectedCode: FAVOURITE_CODE,
    onSelect: fn(),
  },
} satisfies Meta<typeof DriverPickerGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Selected: Story = {};

export const NoSelection: Story = {
  args: {
    selectedCode: undefined,
  },
};

export const OddCount: Story = {
  args: {
    drivers: pickerDrivers.slice(0, 5),
  },
};

export const Interactive: Story = {
  args: {
    selectedCode: undefined,
  },
  render: function InteractiveStory(args) {
    const [selectedCode, setSelectedCode] = useState(args.selectedCode);

    return (
      <DriverPickerGrid
        {...args}
        selectedCode={selectedCode}
        onSelect={(code) => {
          setSelectedCode(code);
          args.onSelect(code);
        }}
      />
    );
  },
};
