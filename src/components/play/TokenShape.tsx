'use client';

import React from 'react';

// Interactive action token: green=pentagon, yellow=inverted triangle, red=square.
// The button keeps a 44px minimum hit area regardless of the SVG size (touch target).

export function TokenShape({
    color,
    spent,
    size = 31,
    selected = false,
    onClick,
}: {
    color: 'green' | 'yellow' | 'red';
    spent: boolean;
    size?: number;
    selected?: boolean;
    onClick?: (e: React.MouseEvent) => void;
}) {
    const fills: Record<string, { active: string; dim: string; stroke: string }> = {
        green:  { active: '#22c55e', dim: '#0f3d1e', stroke: '#166534' },
        yellow: { active: '#eab308', dim: '#3d3003', stroke: '#854d0e' },
        red:    { active: '#dc2626', dim: '#3d0a0a', stroke: '#991b1b' },
    };
    const { active, dim, stroke } = fills[color];
    const fill = spent ? dim : active;
    const strokeColor = spent ? stroke : 'black';
    const glow = !spent ? `drop-shadow(0 0 3px ${active}80)` : 'none';
    const selGlow = selected ? `drop-shadow(0 0 6px white)` : glow;

    // Horizontal hit area widened to 44px; vertical kept at SVG height so the
    // stacked token strip spacing is unchanged (adjacent tokens catch stray taps).
    const btnClass = 'transition-transform min-w-[44px] flex items-center justify-center';
    const btnStyle: React.CSSProperties = { transform: selected ? 'scale(1.2)' : undefined };

    let shape: React.ReactNode;
    if (color === 'green') {
        const cx = size / 2, cy = size / 2, r = size * 0.42;
        const pts = Array.from({ length: 5 }, (_, i) => {
            const angle = (2 * Math.PI / 5) * i + Math.PI / 2;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(' ');
        shape = <polygon points={pts} fill={fill} stroke={strokeColor} strokeWidth="1.2" />;
    } else if (color === 'yellow') {
        const s = size;
        const pts = `${s * 0.1},${s * 0.15} ${s * 0.9},${s * 0.15} ${s * 0.5},${s * 0.88}`;
        shape = <polygon points={pts} fill={fill} stroke={strokeColor} strokeWidth="1.2" />;
    } else {
        const inset = size * 0.12;
        shape = <rect x={inset} y={inset} width={size - inset * 2} height={size - inset * 2}
            fill={fill} stroke={strokeColor} strokeWidth="1.2" rx="2" />;
    }

    return (
        <button className={btnClass} style={btnStyle} onClick={onClick}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: selGlow }}>
                {shape}
            </svg>
        </button>
    );
}
