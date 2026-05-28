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
