'use client';

import React, { useEffect, useState } from 'react';
import { useT } from '@/i18n';

// Full-screen match cinematics overlay (wound flash, heal sweep, FLATLINED stamp).
// Driven by an event object — re-fires whenever event.key changes.

export type MatchFXEvent = { kind: 'wound' | 'heal' | 'kia'; key: number; label?: string };

const DURATIONS: Record<MatchFXEvent['kind'], number> = {
    wound: 400,
    heal: 850,
    kia: 1400,
};

export function MatchFX({ event }: { event: MatchFXEvent | null }) {
    const t = useT();
    const [active, setActive] = useState<MatchFXEvent | null>(null);

    useEffect(() => {
        if (!event) return;
        setActive(event);
        const timer = setTimeout(() => setActive(null), DURATIONS[event.kind]);
        return () => clearTimeout(timer);
    }, [event]);

    if (!active) return null;

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {active.kind === 'wound' && (
                <div className="absolute inset-0 bg-[#FF003C]/15 animate-fx-flash" />
            )}
            {active.kind === 'heal' && (
                <div className="absolute inset-0 bg-[#00F0FF]/[0.06] animate-fx-flash" style={{ animationDuration: '0.8s' }} />
            )}
            {active.kind === 'kia' && (
                <div className="absolute inset-0 bg-black/70 animate-fx-veil scanlines flex items-center justify-center">
                    <div className="animate-fx-stamp border-[4px] border-red-600 px-8 py-3"
                        style={{ boxShadow: '0 0 24px rgba(220,38,38,0.6), inset 0 0 24px rgba(220,38,38,0.2)' }}>
                        <span className="font-display text-5xl sm:text-6xl font-black uppercase tracking-[0.2em] leading-none whitespace-nowrap"
                            style={{ color: '#dc2626', textShadow: '0 0 12px rgba(220,38,38,0.8), 0 0 40px rgba(220,38,38,0.4)' }}>
                            {t('play.flatlined')}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
