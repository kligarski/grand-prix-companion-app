import type { Meta, StoryObj } from "@storybook/react-native";

import { constructorStandings, driverStandings, FAVOURITE_CODE } from "@/mocks/drivers";

import { StandingsTable } from "./StandingsTable";

const meta = {
  title: "UI/StandingsTable",
  component: StandingsTable,
  args: {
    entries: driverStandings,
    favouriteId: FAVOURITE_CODE,
    limit: 3,
  },
} satisfies Meta<typeof StandingsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Drivers: Story = {};

export const AllDrivers: Story = {
  args: {
    limit: undefined,
  },
};

export const Constructors: Story = {
  args: {
    entries: constructorStandings,
    favouriteId: undefined,
  },
};
