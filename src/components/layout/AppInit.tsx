'use client';

// Seed logic is now handled directly by the Zustand persist middleware
// in useStore.ts (onRehydrateStorage callback), which is the only reliable
// way to run after hydration completes. This component is kept as a no-op
// placeholder in case future init logic is needed.

export function AppInit() {
    return null;
}
