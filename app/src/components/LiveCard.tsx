import { Button as UIButton, Host } from "@expo/ui";
import { Button as ComposeButton, Text } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { Button as SwiftUIButton, Text as SwiftUIText } from "@expo/ui/swift-ui";
import { buttonStyle, controlSize, frame, tint } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import { Platform, View } from "react-native";

import { useLive, useSessionData } from "@/api/LiveSessionProvider";
import type { SessionStatus, TrackStatus } from "@/api/protocol";
import { AppText, Card, LiveBadge } from "@/components/ui";
import { usePreferences } from "@/preferences/PreferencesProvider";
import { palette, useTheme } from "@/theme";

const TRACK_STATUS: Record<TrackStatus, string | null> = {
  green: null,
  yellow: "Yellow flag",
  sc: "Safety car",
  vsc: "Virtual safety car",
  vscEnding: "Virtual safety car ending",
  red: "Red flag",
};

/** The badge at the top of the live card: red only while the session runs. */
function LiveCardBadge({ sessionStatus }: { sessionStatus: SessionStatus | undefined }) {
  switch (sessionStatus) {
    case "started":
      return <LiveBadge label="LIVE NOW" />;
    case "finished":
    case "finalised":
      return <LiveBadge label="FINISHED" tone="neutral" />;
    case "inactive":
      return <LiveBadge label="STARTING SOON" tone="neutral" />;
    default:
      return null;
  }
}

/**
 * The live session card, or "Can't reach the server" when a fetch or the socket failed. It reads the
 * live state itself, so only it re-renders on every live update, not the whole dashboard.
 */
export function LiveCard() {
  const { scheme } = useTheme();
  const { session, sessionError, seasonError, loading, reload } = useSessionData();
  const { status, live, reconnect } = useLive();
  const { showSpoilers } = usePreferences();
  const fetchFailed = sessionError !== null || seasonError !== null;
  const socketFailed = status === "closed" || status === "error";

  const openLiveTiming = () => router.push("/live");
  const retry = () => {
    if (fetchFailed) reload();
    if (status !== "open") reconnect();
  };

  if (fetchFailed || socketFailed) {
    return (
      <Card>
        <View>
          <AppText variant="title">{"Can't reach the server"}</AppText>
          <AppText variant="callout" color="textSecondary">
            Check your connection and try again.
          </AppText>
        </View>
        <Host matchContents colorScheme={scheme}>
          <UIButton label="Retry" variant="outlined" disabled={loading} onPress={retry} />
        </Host>
      </Card>
    );
  }

  if (!session) return null;

  // The track status gives away incidents, so it's a spoiler; the lap isn't.
  const liveSummary = live
    ? [
        session.name,
        `Lap ${live.state.lap} of ${live.state.totalLaps}`,
        showSpoilers ? TRACK_STATUS[live.state.trackStatus] : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <Card>
      <LiveCardBadge sessionStatus={live?.state.sessionStatus} />
      <View>
        <AppText variant="title">{session.meeting}</AppText>
        {liveSummary ? (
          <AppText variant="callout" color="textSecondary">
            {liveSummary}
          </AppText>
        ) : null}
      </View>
      <Host matchContents={{ vertical: true }} colorScheme={scheme}>
        {Platform.OS === "ios" ? (
          <SwiftUIButton
            onPress={openLiveTiming}
            modifiers={[buttonStyle("borderedProminent"), controlSize("large"), tint(palette.brand)]}
          >
            <SwiftUIText modifiers={[frame({ maxWidth: Infinity })]}>Watch live timing</SwiftUIText>
          </SwiftUIButton>
        ) : (
          <ComposeButton
            onClick={openLiveTiming}
            colors={{ containerColor: palette.brand, contentColor: palette.white }}
            modifiers={[fillMaxWidth()]}
          >
            <Text>Watch live timing</Text>
          </ComposeButton>
        )}
      </Host>
    </Card>
  );
}
