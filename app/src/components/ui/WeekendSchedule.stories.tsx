import type { Meta, StoryObj } from "@storybook/react-native";

import { AppText } from "./AppText";
import { Card } from "./Card";
import { WeekendSchedule } from "./WeekendSchedule";

const meta = {
  title: "UI/WeekendSchedule",
  component: WeekendSchedule,
  args: {
    sessions: [
      { key: "FP1", title: "Practice 1", subtitle: "Fri 12:30", status: "finished" },
      { key: "FP2", title: "Practice 2", subtitle: "Fri 16:00", status: "finished" },
      { key: "FP3", title: "Practice 3", subtitle: "Sat 11:30", status: "finished" },
      { key: "Qualifying", title: "Qualifying", subtitle: "Sat 15:00", status: "finished" },
      { key: "Race", title: "Race", subtitle: "Sun 15:00", status: "live" },
    ],
  },
  decorators: [
    (Story) => (
      <Card>
        <Story />
      </Card>
    ),
  ],
} satisfies Meta<typeof WeekendSchedule>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RaceLive: Story = {};

export const Upcoming: Story = {
  args: {
    sessions: [
      { key: "FP1", title: "Practice 1", subtitle: "Fri 12:30", status: "finished" },
      { key: "SprintQualifying", title: "Sprint Qualifying", subtitle: "Fri 16:30", status: "live" },
      { key: "Sprint", title: "Sprint", subtitle: "Sat 12:00" },
      { key: "Qualifying", title: "Qualifying", subtitle: "Sat 16:00" },
      { key: "Race", title: "Race", subtitle: "Sun 15:00" },
    ],
  },
};

export const WithTrailing: Story = {
  args: {
    sessions: [
      {
        key: "Qualifying",
        title: "Qualifying",
        subtitle: "Sat 15:00",
        status: "finished",
        trailing: <AppText color="link">Results</AppText>,
      },
      { key: "Race", title: "Race", subtitle: "Sun 15:00", status: "finished" },
    ],
  },
};
