import { useStore } from '@/store/useStore';
import { CSSProperties, useEffect, useState } from 'react';

export const GRID_CLASSES: Record<number, string> = {
    2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
    5: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4',
    6: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
};

// Mirror of GRID_CLASSES, resolved per Tailwind breakpoint (sm 640 / md 768 / lg 1024 / xl 1280).
// KEEP IN SYNC with GRID_CLASSES above.
const GRID_BREAKPOINT_COLS: Record<number, { base: number; sm: number; md: number; lg: number; xl: number }> = {
    2: { base: 1, sm: 1, md: 2, lg: 2, xl: 2 },
    3: { base: 1, sm: 1, md: 2, lg: 3, xl: 3 },
    4: { base: 1, sm: 1, md: 2, lg: 3, xl: 4 },
    5: { base: 1, sm: 2, md: 3, lg: 4, xl: 5 },
    6: { base: 2, sm: 3, md: 4, lg: 5, xl: 6 },
};

function resolveColumns(cardColumns: number, width: number): number {
    const bp = GRID_BREAKPOINT_COLS[cardColumns] ?? GRID_BREAKPOINT_COLS[4];
    if (width >= 1280) return bp.xl;
    if (width >= 1024) return bp.lg;
    if (width >= 768) return bp.md;
    if (width >= 640) return bp.sm;
    return bp.base;
}

export function useCardGrid() {
    const { displaySettings } = useStore();
    const { cardColumns = 4, fontScale = 100 } = displaySettings ?? {};

    const gridClass = GRID_CLASSES[cardColumns] ?? GRID_CLASSES[4];
    const cardStyle: CSSProperties = fontScale !== 100
        ? { zoom: fontScale / 100 }
        : {};

    return { gridClass, cardStyle };
}

/** Number of columns ACTUALLY rendered at the current viewport width (SSR-safe). */
export function useEffectiveColumns(): number {
    const cardColumns = useStore(s => s.displaySettings?.cardColumns ?? 4);
    const [cols, setCols] = useState(cardColumns);

    useEffect(() => {
        const update = () => setCols(resolveColumns(cardColumns, window.innerWidth));
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [cardColumns]);

    return cols;
}
