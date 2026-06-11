'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';

// Fake terminal boot screen shown while the catalog loads from Supabase.
// Turns the initial fetch wait into an identity moment. Shows once per session.

const BOOT_LINES = [
    '> NIGHT CITY ARCHIVES v9.2',
    '> ESTABLISHING NEURAL-LINK...',
    '> AUTH HANDSHAKE ............ OK',
    '> FETCHING FACTIONS / LINEAGES / PROFILES',
    '> FETCHING WEAPONS / GEAR / PROGRAMS',
    '> FETCHING OBJECTIVES / LOOT TABLES',
];

const LINE_INTERVAL_MS = 130;
const MIN_DURATION_MS = 1200;
const SAFETY_TIMEOUT_MS = 8000;
const FADE_MS = 400;

export function BootSequence() {
    const catalogStatus = useStore(s => s.catalogStatus);
    const [mounted, setMounted] = useState(false);
    const [visibleLines, setVisibleLines] = useState(0);
    const [phase, setPhase] = useState<'booting' | 'fading' | 'done'>('booting');
    const startRef = useRef(0);

    // Client-only + once per browser session
    useEffect(() => {
        if (sessionStorage.getItem('cz-booted')) {
            setPhase('done');
            return;
        }
        startRef.current = performance.now();
        setMounted(true);
    }, []);

    // Reveal lines progressively
    useEffect(() => {
        if (!mounted || phase !== 'booting') return;
        if (visibleLines >= BOOT_LINES.length) return;
        const timer = setTimeout(() => setVisibleLines(v => v + 1), LINE_INTERVAL_MS);
        return () => clearTimeout(timer);
    }, [mounted, phase, visibleLines]);

    // Dismiss when the catalog is ready (or on safety timeout)
    useEffect(() => {
        if (!mounted || phase !== 'booting') return;

        const dismiss = () => {
            sessionStorage.setItem('cz-booted', '1');
            setPhase('fading');
            setTimeout(() => setPhase('done'), FADE_MS);
        };

        const safety = setTimeout(dismiss, SAFETY_TIMEOUT_MS);
        if (catalogStatus !== 'loading') {
            const elapsed = performance.now() - startRef.current;
            const wait = Math.max(0, MIN_DURATION_MS - elapsed);
            const timer = setTimeout(dismiss, wait);
            return () => { clearTimeout(timer); clearTimeout(safety); };
        }
        return () => clearTimeout(safety);
    }, [mounted, phase, catalogStatus]);

    if (!mounted || phase === 'done') return null;

    return (
        <div
            className={`fixed inset-0 z-[200] bg-black scanlines flex items-center justify-center transition-opacity duration-400 ${phase === 'fading' ? 'opacity-0' : 'opacity-100'}`}
        >
            <div className="w-full max-w-md px-6 font-mono-tech text-sm leading-relaxed">
                {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                    <div key={i} className="text-[#00FF41]/90">{line}</div>
                ))}
                {catalogStatus === 'fallback' && visibleLines >= BOOT_LINES.length && (
                    <div className="text-primary">&gt; OFFLINE CACHE LOADED</div>
                )}
                {catalogStatus === 'ready' && visibleLines >= BOOT_LINES.length && (
                    <div className="text-secondary">&gt; GRID LINK ESTABLISHED</div>
                )}
                <div className="text-[#00FF41]/90">
                    <span className="inline-block w-2.5 h-4 bg-[#00FF41]/80 align-middle animate-pulse" />
                </div>
            </div>
        </div>
    );
}
