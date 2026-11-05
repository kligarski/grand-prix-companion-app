import type { Meta, StoryObj } from "@storybook/react-native";

import { typography, type TypographyVariant } from "@/theme";

import { AppText } from "./AppText";

const variants = Object.keys(typography) as TypographyVariant[];

const meta = {
  title: "UI/AppText",
  component: AppText,
  args: {
    children: "Race weekend",
    variant: "title",
    color: "text",
  },
  argTypes: {
    variant: { control: "select", options: variants },
  },
} satisfies Meta<typeof AppText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <>
      {variants.map((variant) => (
        <AppText key={variant} variant={variant}>
          {variant} · KOV +0.844
        </AppText>
      ))}
    </>
  ),
};
