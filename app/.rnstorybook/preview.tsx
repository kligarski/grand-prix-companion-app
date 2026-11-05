import type { Preview } from "@storybook/react-native";
import type { ReactNode } from "react";
import { View } from "react-native";

import { createThemedStyles, spacing } from "@/theme";

function StoryCanvas({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <View style={styles.canvas}>{children}</View>;
}

const useStyles = createThemedStyles(({ colors }) => ({
  canvas: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
}));

const preview: Preview = {
  decorators: [
    (Story) => (
      <StoryCanvas>
        <Story />
      </StoryCanvas>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
      },
    },
  },
};

export default preview;
