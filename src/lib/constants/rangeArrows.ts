// THE single set of range-arrow chevron coordinates.
// Absolute rule: these polygons must be identical everywhere they are drawn.
// Red 48px, Yellow 48px, Green 47px, Long 70px (the widest).
export const RANGE_ARROW_POINTS = {
    red:    '1,1 44,1 49,11 44,21 5,21',
    yellow: '52,1 95,1 100,11 95,21 52,21 57,11',
    green:  '103,1 145,1 150,11 145,21 103,21 108,11',
    long:   '153,1 218,1 223,11 218,21 153,21 158,11',
    plusCx: 188,
} as const;

export const RANGE_ARROW_VIEWBOX = '0 0 228 22';

export const RANGE_OFF = 'rgba(100,100,100,0.35)';
export const RANGE_OFF_STROKE = 'rgba(255,255,255,0.3)';
export const RANGE_ON_STROKE = 'white';

export const RANGE_FILLS = {
    red: '#dc2626',
    yellow: '#eab308',
    green: '#22c55e',
    long: '#111111',
} as const;
