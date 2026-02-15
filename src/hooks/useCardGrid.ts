import { useStore } from '@/store/useStore';
import { CSSProperties } from 'react';

const GRID_CLASSES: Record<number, string> = {
    2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
    5: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4',
    6: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
};

export function useCardGrid() {
    const { displaySettings } = useStore();
    const { cardColumns = 4, fontScale = 100 } = displaySettings ?? {};

    const gridClass = GRID_CLASSES[cardColumns] ?? GRID_CLASSES[4];
    const cardStyle: CSSProperties = fontScale !== 100
        ? { zoom: fontScale / 100 }
        : {};

    return { gridClass, cardStyle };
}
