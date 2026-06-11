'use client';

import React from 'react';
import { RotateCw, Cross, Heart, X } from 'lucide-react';
import { useT } from '@/i18n';

// Compact floating action pill — appears above the bottom nav when a token
// is selected during a match. Touch-friendly but discreet.

interface ActionDockProps {
    characterName: string;
    tokenColor: 'green' | 'yellow' | 'red';
    spent: boolean;
    wounded: boolean;
    canWound: boolean;
    onSpend: () => void;
    onReactivate: () => void;
    onWound: () => void;
    onHeal: () => void;
    onDismiss: () => void;
}

function DockButton({ onClick, title, className, children }: { onClick: () => void; title: string; className: string; children: React.ReactNode }) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            title={title}
            className={`h-10 px-3 flex items-center gap-1.5 font-mono-tech text-[10px] uppercase tracking-wider border transition-all active:scale-95 ${className}`}
        >
            {children}
        </button>
    );
}

const TOKEN_DOT: Record<string, string> = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-600',
};

export function ActionDock({ characterName, tokenColor, spent, wounded, canWound, onSpend, onReactivate, onWound, onHeal, onDismiss }: ActionDockProps) {
    const t = useT();
    return (
        <div
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 fade-in-0 duration-150"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-1.5 bg-black/95 backdrop-blur border border-primary/50 clip-corner-br pl-3 pr-1.5 py-1.5 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                <span className={`w-2 h-2 shrink-0 ${TOKEN_DOT[tokenColor]} ${spent ? 'opacity-40' : ''}`} />
                <span className="font-mono-tech text-[10px] uppercase tracking-wider text-white/70 max-w-[90px] truncate mr-1">{characterName}</span>
                {!spent ? (
                    <DockButton onClick={onSpend} title={t('play.spend')} className="border-white/30 text-white hover:bg-white hover:text-black">
                        <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2 6.5L5 9.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        {t('play.spend')}
                    </DockButton>
                ) : (
                    <DockButton onClick={onReactivate} title={t('play.reactivate')} className="border-secondary/50 text-secondary hover:bg-secondary hover:text-black">
                        <RotateCw className="w-3.5 h-3.5" />
                        {t('play.reactivate')}
                    </DockButton>
                )}
                {canWound && (
                    <DockButton onClick={onWound} title={t('play.wound')} className="border-accent/50 text-accent hover:bg-accent hover:text-white">
                        <Cross className="w-3.5 h-3.5" />
                        {t('play.wound')}
                    </DockButton>
                )}
                {wounded && (
                    <DockButton onClick={onHeal} title={t('play.heal')} className="border-green-500/50 text-green-500 hover:bg-green-500 hover:text-black">
                        <Heart className="w-3.5 h-3.5" />
                        {t('play.heal')}
                    </DockButton>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                    className="h-10 w-8 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                    title={t('common.close')}
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
