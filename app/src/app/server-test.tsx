import { Button, Host } from "@expo/ui";
import { useEffect, useState } from "react";
import { Platform, ScrollView, View } from "react-native";

import type { SessionInfo } from "@/api/protocol";
import { SERVER_URL, SESSION_ID } from "@/api/server";
import { useLiveSession } from "@/api/useLiveSession";
import { AppText, Card } from "@/components/ui";
import { createThemedStyles, radii, spacing } from "@/theme";

const MAX_JSON_CHARS = 3000;

type Endpoint = { label: string; method: "GET" | "POST"; path: string; body?: unknown };

const ENDPOINTS: Endpoint[] = [
  { label: "Health", method: "GET", path: "/health" },
  { label: "Sessions", method: "GET", path: "/sessions" },
  { label: "Session", method: "GET", path: `/sessions/${SESSION_ID}` },
  { label: "Season", method: "GET", path: "/season" },
  { label: "Circuit", method: "GET", path: "/circuits/spa" },
  // Needs the server started with DEV_CONTROLS=1. The safety car is on lap 2.
  { label: "Replay lap 2", method: "POST", path: "/dev/replay", body: { from: { lap: 2 } } },
];

type Response = { endpoint: Endpoint; status: number | null; ms: number; body: unknown };

function preview(value: unknown) {
  const json = JSON.stringify(value, null, 2) ?? String(value);
  return json.length > MAX_JSON_CHARS
    ? `${json.slice(0, MAX_JSON_CHARS)}\n… ${json.length - MAX_JSON_CHARS} more characters`
    : json;
}

async function request(endpoint: Endpoint): Promise<Response> {
  const started = Date.now();
  try {
    const response = await fetch(SERVER_URL + endpoint.path, {
      method: endpoint.method,
      headers: endpoint.body ? { "Content-Type": "application/json" } : undefined,
      body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
    });
    const text = await response.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {}
    return { endpoint, status: response.status, ms: Date.now() - started, body };
  } catch (error) {
    return { endpoint, status: null, ms: Date.now() - started, body: String(error) };
  }
}

function formatGap(gap: { ms: number | null; laps: number } | null) {
  if (!gap) return "–";
  if (gap.laps > 0) return `+${gap.laps}L`;
  return gap.ms === null ? "–" : `+${(gap.ms / 1000).toFixed(3)}`;
}

function NativeButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Host matchContents>
      <Button label={label} variant="outlined" onPress={onPress} />
    </Host>
  );
}

export default function ServerTest() {
  const styles = useStyles();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [response, setResponse] = useState<Response | null>(null);
  const { status, live, lastMessage, connect, disconnect, send } = useLiveSession(SESSION_ID);

  const run = async (endpoint: Endpoint) => setResponse(await request(endpoint));

  useEffect(() => {
    request(ENDPOINTS[1]).then((result) => {
      setResponse(result);
      if (Array.isArray(result.body)) setSession(result.body[0] ?? null);
    });
  }, []);

  const top = live
    ? Object.entries(live.state.drivers)
        .filter(([, driver]) => driver.position !== null)
        .sort(([, a], [, b]) => (a.position ?? 0) - (b.position ?? 0))
        .slice(0, 5)
    : [];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen} contentContainerStyle={styles.content}>
      <Card>
        <AppText variant="overline" color="textSecondary">
          Server
        </AppText>
        <AppText variant="bodyStrong">{SERVER_URL}</AppText>
        <AppText variant="footnote" color="textSecondary">
          {session ? `${session.meeting} · ${session.name} · ${session.totalLaps} laps` : "No session loaded yet"}
        </AppText>
      </Card>

      <Card>
        <AppText variant="overline" color="textSecondary">
          REST
        </AppText>
        <View style={styles.buttons}>
          {ENDPOINTS.map((endpoint) => (
            <NativeButton key={endpoint.label} label={endpoint.label} onPress={() => run(endpoint)} />
          ))}
        </View>
        {response ? (
          <>
            <AppText variant="footnote" color="textSecondary">
              {`${response.endpoint.method} ${response.endpoint.path} · ${response.status ?? "failed"} · ${response.ms} ms`}
            </AppText>
            <AppText variant="caption" style={styles.json}>
              {preview(response.body)}
            </AppText>
          </>
        ) : null}
      </Card>

      <Card>
        <AppText variant="overline" color="textSecondary">
          {`Live · ${status}`}
        </AppText>
        <View style={styles.buttons}>
          <NativeButton label="Connect" onPress={() => connect()} />
          <NativeButton label="Disconnect" onPress={disconnect} />
          <NativeButton label="Delay 0 s" onPress={() => send({ type: "setDelay", delayMs: 0 })} />
          <NativeButton label="Delay 8 s" onPress={() => send({ type: "setDelay", delayMs: 8000 })} />
          {live ? (
            <NativeButton
              label={`Sync tap lap ${live.state.lap}`}
              onPress={() => send({ type: "syncTap", leaderLap: live.state.lap })}
            />
          ) : null}
        </View>
        {live ? (
          <>
            <AppText variant="callout" tabular>
              {`Lap ${live.state.lap}/${live.state.totalLaps} · ${live.state.trackStatus} · ${live.state.sessionStatus}\n` +
                `t ${live.t} · live ${live.liveT} · delay ${live.delayMs / 1000} s`}
            </AppText>
            {top.map(([number, driver]) => (
              <AppText key={number} variant="callout" tabular>
                {`P${driver.position}  #${number}  ${formatGap(driver.gapToLeader)}  ${driver.tyre?.compound ?? ""}`}
              </AppText>
            ))}
          </>
        ) : null}
        {lastMessage ? (
          <>
            <AppText variant="footnote" color="textSecondary">
              Last message
            </AppText>
            <AppText variant="caption" style={styles.json}>
              {preview(lastMessage)}
            </AppText>
          </>
        ) : null}
      </Card>
    </ScrollView>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  screen: {
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  buttons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  json: {
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
}));
