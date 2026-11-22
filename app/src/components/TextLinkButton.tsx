import { Host } from "@expo/ui";
import { Text as ComposeText, TextButton } from "@expo/ui/jetpack-compose";
import { Button as SwiftUIButton, Text as SwiftUIText } from "@expo/ui/swift-ui";
import { buttonStyle, controlSize, frame, tint } from "@expo/ui/swift-ui/modifiers";
import { Platform } from "react-native";

import { useTheme } from "@/theme";

type Props = {
  label: string;
  onPress: () => void;
  /** iOS tint. Android always uses the link colour, like Material text buttons. Defaults to the link colour. */
  iosColor?: string;
};

/**
 * A secondary text-only action, such as "Skip for now" or "No favourite". iOS: a large borderless
 * button that spans the width. Android: a Material text button sized to its label.
 */
export function TextLinkButton({ label, onPress, iosColor }: Props) {
  const { scheme, colors } = useTheme();

  if (Platform.OS === "ios") {
    return (
      <Host matchContents={{ vertical: true }} colorScheme={scheme}>
        <SwiftUIButton
          onPress={onPress}
          modifiers={[buttonStyle("borderless"), controlSize("large"), tint(iosColor ?? colors.link)]}
        >
          <SwiftUIText modifiers={[frame({ maxWidth: Infinity })]}>{label}</SwiftUIText>
        </SwiftUIButton>
      </Host>
    );
  }

  return (
    <Host matchContents colorScheme={scheme}>
      <TextButton onClick={onPress} colors={{ contentColor: colors.link }}>
        <ComposeText>{label}</ComposeText>
      </TextButton>
    </Host>
  );
}
