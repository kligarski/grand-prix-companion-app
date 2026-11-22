import { FieldGroup, Host, ListItem, Switch } from "@expo/ui";
import {
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
  Text as ComposeText,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import {
  Button as SwiftUIButton,
  HStack,
  Image,
  Picker,
  Spacer,
  Text as SwiftUIText,
  VStack,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  contentShape,
  font,
  foregroundStyle,
  pickerStyle,
  shapes,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import { Platform, StyleSheet } from "react-native";

import { useSessionData } from "@/api/LiveSessionProvider";
import { useScreenHeader } from "@/hooks/useScreenHeader";
import { usePreferences } from "@/preferences/PreferencesProvider";
import { createThemedStyles, palette, useTheme, type ThemePreference } from "@/theme";

const APPEARANCES: readonly { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Automatic" },
];

const SPOILERS_FOOTER =
  "When off, results and standings stay blurred until you tap them, and the live card hides flags.";

type FavouriteDriver = { name: string; team: string | null };

/** The favourite's full name and team from the session, or its name from the season, or its code. */
function useFavouriteDriver(): FavouriteDriver | null {
  const { favouriteDriverCode } = usePreferences();
  const { session, season } = useSessionData();
  if (!favouriteDriverCode) return null;

  const driver = session?.drivers.find((entry) => entry.code === favouriteDriverCode);
  if (driver) return { name: `${driver.firstName} ${driver.lastName}`, team: driver.team };

  const standing = season?.driverStandings.find((entry) => entry.driver.code === favouriteDriverCode);
  if (standing) return { name: `${standing.driver.firstName} ${standing.driver.lastName}`, team: null };

  return { name: favouriteDriverCode, team: null };
}

const openFavouritePicker = () => router.push("/favourite-driver");

/**
 * iOS: a Form row with the name over the team, and "Change" with a chevron, like a navigation link.
 * Built from SwiftUI views like the universal `ListItem` (a plain button, so the Form doesn't tint the
 * labels), which can't take these: it wraps its trailing slot in an RN host view.
 */
function FavouriteRowIos({ driver }: { driver: FavouriteDriver | null }) {
  return (
    <SwiftUIButton onPress={openFavouritePicker} modifiers={[buttonStyle("plain")]}>
      <HStack spacing={12} modifiers={[contentShape(shapes.rectangle())]}>
        <VStack alignment="leading" spacing={2}>
          <SwiftUIText modifiers={[foregroundStyle({ type: "hierarchical", style: "primary" })]}>
            {driver?.name ?? "None"}
          </SwiftUIText>
          {driver?.team ? (
            <SwiftUIText
              modifiers={[
                font({ textStyle: "subheadline" }),
                foregroundStyle({ type: "hierarchical", style: "secondary" }),
              ]}
            >
              {driver.team}
            </SwiftUIText>
          ) : null}
        </VStack>
        <Spacer />
        <SwiftUIText modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>Change</SwiftUIText>
        <Image
          systemName="chevron.right"
          modifiers={[
            font({ textStyle: "footnote", weight: "semibold" }),
            foregroundStyle({ type: "hierarchical", style: "tertiary" }),
          ]}
        />
      </HStack>
    </SwiftUIButton>
  );
}

/**
 * Android: a Material list item, "Team · tap to change", as in the design. A plain function, not a
 * component: the section styles a `ListItem` child as its row only when it gets the element itself.
 */
function favouriteListItem(driver: FavouriteDriver | null) {
  const supporting = driver?.team ? `${driver.team} · tap to change` : "Tap to change";
  return (
    <ListItem onPress={openFavouritePicker} supportingText={supporting}>
      {driver?.name ?? "None"}
    </ListItem>
  );
}

/**
 * Light / Dark / Automatic as a native segmented control: SwiftUI's segmented `Picker`, or Material
 * segmented buttons in the brand blue, as in the design.
 */
function AppearancePicker() {
  const { preference, setPreference, colors } = useTheme();

  if (Platform.OS === "ios") {
    return (
      <Picker<ThemePreference>
        label="Appearance"
        selection={preference}
        onSelectionChange={setPreference}
        modifiers={[pickerStyle("segmented")]}
      >
        {APPEARANCES.map(({ value, label }) => (
          <SwiftUIText key={value} modifiers={[tag(value)]}>
            {label}
          </SwiftUIText>
        ))}
      </Picker>
    );
  }

  const buttonColors = {
    activeContainerColor: palette.brand,
    activeContentColor: palette.white,
    activeBorderColor: palette.brand,
    inactiveContainerColor: colors.surface,
    inactiveContentColor: colors.text,
    inactiveBorderColor: colors.border,
  };

  return (
    <SingleChoiceSegmentedButtonRow modifiers={[fillMaxWidth()]}>
      {APPEARANCES.map(({ value, label }) => (
        <SegmentedButton
          key={value}
          selected={value === preference}
          onClick={() => setPreference(value)}
          colors={buttonColors}
          modifiers={[weight(1)]}
        >
          <SegmentedButton.Label>
            <ComposeText maxLines={1} softWrap={false}>
              {label}
            </ComposeText>
          </SegmentedButton.Label>
        </SegmentedButton>
      ))}
    </SingleChoiceSegmentedButtonRow>
  );
}

/** A section footer: plain text that the iOS Form styles itself, or secondary body text on Android. */
function Footer({ children }: { children: string }) {
  const { colors } = useTheme();
  if (Platform.OS === "ios") return <SwiftUIText>{children}</SwiftUIText>;
  return (
    <ComposeText color={colors.textSecondary} style={FOOTER_TEXT_STYLE}>
      {children}
    </ComposeText>
  );
}

/**
 * A native grouped list: SwiftUI `Form` on iOS, Material grouped list on Android. Every row edits a
 * stored preference, so changes apply everywhere at once and survive a relaunch.
 */
export default function Settings() {
  useScreenHeader({ title: "Settings", large: true });
  const { scheme } = useTheme();
  const themedStyles = useStyles();
  const { showSpoilers, setShowSpoilers } = usePreferences();
  const favourite = useFavouriteDriver();

  return (
    <Host style={styles.fill} colorScheme={scheme}>
      <FieldGroup style={Platform.OS === "android" ? themedStyles.fieldGroupAndroid : undefined}>
        <FieldGroup.Section title="Favourite driver">
          {Platform.OS === "ios" ? <FavouriteRowIos driver={favourite} /> : favouriteListItem(favourite)}
        </FieldGroup.Section>
        <FieldGroup.Section title="Spoilers">
          <Switch label="Show results and standings" value={showSpoilers} onValueChange={setShowSpoilers} />
          <FieldGroup.SectionFooter>
            <Footer>{SPOILERS_FOOTER}</Footer>
          </FieldGroup.SectionFooter>
        </FieldGroup.Section>
        <FieldGroup.Section title="Appearance">
          <AppearancePicker />
          <FieldGroup.SectionFooter>
            <Footer>Automatic follows the system appearance.</Footer>
          </FieldGroup.SectionFooter>
        </FieldGroup.Section>
      </FieldGroup>
    </Host>
  );
}

const FOOTER_TEXT_STYLE = { typography: "bodyMedium" } as const;

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

const useStyles = createThemedStyles(({ colors }) => ({
  // The Material list defaults to its tinted surface; the app background matches the header.
  fieldGroupAndroid: {
    backgroundColor: colors.background,
  },
}));
