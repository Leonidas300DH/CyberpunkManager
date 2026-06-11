'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useT } from '@/i18n';

// Full-screen Victory/Defeat picker shown when the match ends, before the
// post-game wizard. The emotional beat of the session — make it theatrical.

interface MatchResultScreenProps {
    open: boolean;
    onSelect: (result: 'victory' | 'defeat') => void;
    onCancel: () => void;
}

export function MatchResultScreen({ open, onSelect, onCancel }: MatchResultScreenProps) {
    const t = useT();
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[90] bg-black scanlines flex flex-col animate-in fade-in-0 duration-300">
            <div className="flex justify-end p-4">
                <button onClick={onCancel} className="p-3 text-muted-foreground hover:text-white transition-colors" title={t('common.close')}>
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 pb-16">
                <div className="font-mono-tech text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    ▌{t('play.matchOutcome')}
                </div>
                <button
                    onClick={() => onSelect('victory')}
                    className="group w-full max-w-md py-10 border-2 border-primary bg-primary/5 clip-corner-tl-br hover:bg-primary/15 transition-all animate-in slide-in-from-left-8 fade-in-0 duration-500"
                >
                    <span className="font-display text-6xl sm:text-7xl font-black uppercase tracking-[0.15em] text-primary glitch-text text-glow-primary group-hover:glitch-hover"
                        data-text={t('postGame.victory')}>
                        {t('postGame.victory')}
                    </span>
                </button>
                <button
                    onClick={() => onSelect('defeat')}
                    className="group w-full max-w-md py-10 border-2 border-accent bg-accent/5 clip-corner-tl-br hover:bg-accent/15 transition-all animate-in slide-in-from-right-8 fade-in-0 duration-500"
                >
                    <span className="font-display text-6xl sm:text-7xl font-black uppercase tracking-[0.15em] text-accent glitch-text"
                        style={{ textShadow: '0 0 10px rgba(255,0,60,0.6), 0 0 30px rgba(255,0,60,0.3)' }}
                        data-text={t('postGame.defeat')}>
                        {t('postGame.defeat')}
                    </span>
                </button>
            </div>
        </div>
    );
}
