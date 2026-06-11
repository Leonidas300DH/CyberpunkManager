'use client';

import type { RangeType } from '@/types';
import {
    RANGE_ARROW_POINTS as PTS,
    RANGE_ARROW_VIEWBOX,
    RANGE_FILLS,
    RANGE_OFF,
    RANGE_OFF_STROKE,
    RANGE_ON_STROKE,
} from '@/lib/constants/rangeArrows';

// 'muted' renders the segment greyed-out but solid (#666666) — used by program
// ranges like LongOnly/GreenLong where shorter bands are skipped, not inactive.
export type RangeSegState = boolean | 'muted';

const MUTED_FILL = '#666666';

interface RangeArrowsProps {
    red?: RangeSegState;
    yellow?: RangeSegState;
    green?: RangeSegState;
    long?: RangeSegState;
    className?: string;
}

function segProps(state: RangeSegState, fill: string) {
    if (state === true) return { fill, stroke: RANGE_ON_STROKE, opacity: 1 };
    if (state === 'muted') return { fill: MUTED_FILL, stroke: RANGE_OFF_STROKE, opacity: 0.5 };
    return { fill: RANGE_OFF, stroke: RANGE_OFF_STROKE, opacity: 0.5 };
}

/** The single range-arrow chevron strip. Long segment renders only when active. */
export function RangeArrows({ red = false, yellow = false, green = false, long = false, className = 'w-full h-auto' }: RangeArrowsProps) {
    if (!red && !yellow && !green && !long) return null;
    const r = segProps(red, RANGE_FILLS.red);
    const y = segProps(yellow, RANGE_FILLS.yellow);
    const g = segProps(green, RANGE_FILLS.green);
    return (
        <svg viewBox={RANGE_ARROW_VIEWBOX} className={className} fill="none">
            <polygon points={PTS.red}
                fill={r.fill} stroke={r.stroke} strokeWidth="1.5" strokeLinejoin="round"
                opacity={r.opacity} />
            <polygon points={PTS.yellow}
                fill={y.fill} stroke={y.stroke} strokeWidth="1.5" strokeLinejoin="round"
                opacity={y.opacity} />
            <polygon points={PTS.green}
                fill={g.fill} stroke={g.stroke} strokeWidth="1.5" strokeLinejoin="round"
                opacity={g.opacity} />
            {long && (
                <>
                    <polygon points={PTS.long}
                        fill={RANGE_FILLS.long} stroke={RANGE_ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1={PTS.plusCx} y1="8" x2={PTS.plusCx} y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1={PTS.plusCx - 3} y1="11" x2={PTS.plusCx + 3} y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </>
            )}
        </svg>
    );
}

/** Profile-action RangeType → segment flags. Self/Reach yield all-false (renders nothing). */
export function rangeTypeToFlags(range: RangeType): { red: boolean; yellow: boolean; green: boolean; long: boolean } {
    if (range === 'Self' || range === 'Reach') return { red: false, yellow: false, green: false, long: false };
    return {
        red: true,
        yellow: ['Yellow', 'Green', 'Long'].includes(range),
        green: ['Green', 'Long'].includes(range),
        long: range === 'Long',
    };
}

/** Program range enum (incl. LongOnly/GreenLong tri-state) → segment states. */
export function programRangeToSegments(r: string): { red: RangeSegState; yellow: RangeSegState; green: RangeSegState; long: boolean } {
    const skipShort = r === 'LongOnly' || r === 'GreenLong';
    return {
        red: skipShort ? 'muted' : true,
        yellow: skipShort ? 'muted' : (['Yellow', 'Green', 'Long'].includes(r) ? true : false),
        green: r === 'LongOnly' ? 'muted' : (['Green', 'Long', 'GreenLong'].includes(r) ? true : false),
        long: r === 'Long' || r === 'LongOnly' || r === 'GreenLong',
    };
}
