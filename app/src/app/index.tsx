import CheckIcon from "@expo/material-symbols/check.xml";
import SettingsIcon from "@expo/material-symbols/settings.xml";
import { Host, Switch } from "@expo/ui";
import { FilterChip, Icon, IconButton, Row, Text } from "@expo/ui/jetpack-compose";
import { router, useNavigation, type ExperimentalStackNavigationProp } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, View } from "react-native";

import type { Round, Season } from "@/api/protocol";
import { SERVER_URL } from "@/api/server";
import { AppText } from "@/components/ui";
import { spacing, useTheme } from "@/theme";

export default function Dashboard() {
  const { scheme, colors } = useTheme();
  const navigation = useNavigation<ExperimentalStackNavigationProp<ReactNavigation.RootParamList>>();
  const [spoilers, setSpoilers] = useState(true);
  const [round, setRound] = useState<Round | null>(null);

  const openSettings = () => router.push("/settings");

  useEffect(() => {
    fetch(`${SERVER_URL}/season`)
      .then((response) => response.json())
      .then((season: Season) => setRound(season.schedule.find((r) => r.round === season.asOfRound + 1) ?? null));
  }, []);

  const SpoilersSwitch = (
    <View style={styles.spoilers}>
      <Host matchContents colorScheme={scheme}>
        <Switch label="Spoilers" value={spoilers} onValueChange={setSpoilers} />
      </Host>
    </View>
  );

  const AndroidActions = (
    <Host matchContents colorScheme={scheme}>
      <Row verticalAlignment="center">
        <FilterChip selected={spoilers} onClick={() => setSpoilers(!spoilers)}>
          <FilterChip.LeadingIcon>{spoilers ? <Icon source={CheckIcon} size={18} /> : null}</FilterChip.LeadingIcon>
          <FilterChip.Label>
            <Text>Spoilers</Text>
          </FilterChip.Label>
        </FilterChip>
        <IconButton onClick={openSettings}>
          <Icon source={SettingsIcon} contentDescription="Settings" />
        </IconButton>
      </Row>
    </Host>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      unstable_headerConfig: {
        ios: {
          leadingItems: [{ id: "spoilers", type: "item", render: () => SpoilersSwitch }],
          trailingItems: [
            {
              id: "settings",
              type: "item",
              title: "Settings",
              icon: { type: "sfSymbol", name: "gearshape" },
              onPress: openSettings,
            },
          ],
        },
        android: {
          backgroundColor: colors.background,
          scrolledBackgroundColor: colors.background,
          trailingSubview: { render: () => AndroidActions },
        },
      },
    });
  });

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View>
        <AppText variant="largeTitle" accessibilityRole="header">
          Race Weekend
        </AppText>
        {round ? (
          <AppText variant="callout" color="textSecondary">
            {`Round ${round.round} · ${round.name} · ${round.circuit}`}
          </AppText>
        ) : null}
      </View>
      <Button title="Live" onPress={() => router.push("/live")} />
      <Button title="Onboarding" onPress={() => router.push("/onboarding")} />
      {__DEV__ ? <Button title="Storybook" onPress={() => router.push("/storybook")} /> : null}
      {__DEV__ ? <Button title="Server test" onPress={() => router.push("/server-test")} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  spoilers: {
    paddingHorizontal: spacing.md,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
});
