# Agent Guidelines

## Package manager

Always use **bun** — never `npm`, `yarn`, or `pnpm`.

```
bun install
bun add <package>
bun remove <package>
bunx <binary>
```

Scripts:

```
bun dev          # start Expo dev server (clears cache)
bun ios          # run on iOS simulator
bun android      # run on Android emulator
bun lint         # ESLint via expo lint
bun typecheck    # tsc --noEmit
bun format       # Prettier write
```

## Code style

- **No comments.** Do not add inline comments, block comments, or JSDoc to any code you write or modify.
- Use the existing patterns already present in the file you are editing — spacing, import order, naming conventions.

## Safe areas

- Import `SafeAreaView` / `useSafeAreaInsets` from `react-native-safe-area-context`. **Never** use React Native's built-in `SafeAreaView` (deprecated in RN 0.81).
- `SafeAreaProvider` with `initialMetrics={initialWindowMetrics}` lives **once** at the root (`app/_layout.tsx`). Do not add another.
- Android edge-to-edge is on and non-optional — every surface must account for insets or content draws under the status/navigation bars.

When to use which:

- **`SafeAreaView` component** — the default for simple, static, whole-screen surfaces that should be uniformly padded (e.g. a headerless group layout, a full drawer surface). It applies insets natively, so no rotation delay or first-frame flicker.
- **`useSafeAreaInsets` hook** — when only one element needs the inset, or the inset must be dynamic: custom/animated headers, a bottom input or footer, sheet footers, and scroll content. For `ScrollView`/`FlatList`, push the inset into `contentContainerStyle.paddingBottom` so content scrolls under the system bar instead of clipping the scroll track.
- **Do not mix** the component and the hook for the same edge/area.

Edges:

- A native navigation header consumes the top inset automatically — do not add `paddingTop` / the `top` edge when a header is shown.
- With `headerShown: false`, the screen or layout owns the top edge itself (use the `top` edge).
- A group-layout `SafeAreaView` must not statically apply the `bottom` edge when a child sticks to the keyboard (e.g. `KeyboardStickyView`) — handle the bottom inset at the input via the hook so it collapses when the keyboard opens.

## Typography

Two fonts, role-based. `font-sans` = Geist, `font-mono` = Geist Mono. Use the `font-mono` class — **never** inline `style={{ fontFamily: ... }}`.

- **Sans** — titles, headings, button labels, row/card titles, any emphasis (semibold/bold/extrabold).
- **Mono** — secondary / descriptive / technical text: screen subtitles, card/row subtitles & meta, counters, tags, numeric captions.

Scale (do not introduce new sizes):

| Role                       | Recipe                                   | Font |
| -------------------------- | ---------------------------------------- | ---- |
| Hero title (welcome only)  | `text-4xl font-extrabold tracking-tight` | sans |
| Screen title               | `text-3xl font-bold tracking-tight`      | sans |
| Section / sub-screen title | `text-2xl font-bold tracking-tight`      | sans |
| Card/row title             | `text-sm font-semibold`                  | sans |
| Button label               | `text-base font-semibold`                | sans |
| Screen subtitle (lede)     | `text-base leading-relaxed`              | mono |
| Card/row subtitle, meta    | `text-xs leading-relaxed`                | mono |
| Counter / micro caption    | `text-xs`                                | mono |

Color: titles `text-foreground`; secondary / mono text `text-muted-foreground`.
