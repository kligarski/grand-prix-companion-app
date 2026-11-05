This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Styling

- **No inline styles.** Never pass object literals to `style` (`style={{ ... }}`). Define styles with `StyleSheet.create` at the bottom of the file. Theme-dependent styles use `createThemedStyles` from `@/theme`:

  ```tsx
  const useStyles = createThemedStyles(({ colors }) => ({
    container: { backgroundColor: colors.surface, padding: spacing.lg },
  }));

  function MyComponent() {
    const styles = useStyles();
    return <View style={styles.container} />;
  }
  ```

  Variants and states (selected, pressed, favourite, sizes) are separate style entries combined in an array: `style={[styles.row, isFavourite && styles.rowFavourite]}`.
  The only allowed dynamic style is a value that comes from data, e.g. a team colour from the F1 feed. Reanimated `useAnimatedStyle` is fine too.
- **Colours only from tokens.** Use `colors.*` from `useTheme()` / `createThemedStyles` for anything that changes between light and dark mode, and `palette` / `teamColors` from `@/theme` for fixed accents (flags, sectors, tyres). No hex, `rgb()` or named colours outside `src/theme/colors.ts`. Add a new token there instead of hard-coding a colour.
- **Spacing, radii and type from tokens.** Use `spacing`, `radii` and `typography` from `@/theme`, not one-off numbers. Render text with `AppText` and a `variant`, not a raw `Text` with a font size.
- **Native controls first.** Buttons, switches, pickers, segmented controls, settings lists and search fields come from `@expo/ui` (SwiftUI on iOS, Jetpack Compose on Android). `src/components/ui` holds only the custom elements drawn by the designs (position badges, driver rows, tyre badges, cards).

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
