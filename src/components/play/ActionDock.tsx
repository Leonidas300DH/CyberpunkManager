'use client';

import React from 'react';
import { RotateCw, Cross, Heart, X } from 'lucide-react';
import { TokenShape } from '@/components/play/TokenShape';
import { useT } from '@/i18n';

// Bottom action dock — appears when a token is selected during a match.
// Replaces the 22px inline ActionBtn row: big chamfered touch targets, game-HUD style.

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

function DockButton({ onClick, className, children }: { onClick: () => void; className: string; children: React.ReactNode }) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`flex-1 min-h-[56px] flex flex-col items-center justify-center gap-0.5 font-display font-bold text-xs uppercase tracking-wider transition-all active:scale-95 ${className}`}
        >
            {children}
        </button>
    );
}

export function ActionDock({ characterName, tokenColor, spent, wounded, canWound, onSpend, onReactivate, onWound, onHeal, onDismiss }: ActionDockProps) {
    const t = useT();
    return (
        <div
            className="fixed bottom-20 inset-x-0 z-50 bg-black/95 backdrop-blur border-t-2 border-primary animate-in slide-in-from-bottom-4 fade-in-0 duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="container mx-auto px-4 py-2">
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                        <TokenShape color={tokenColor} spent={spent} size={24} />
                        <span className="font-display font-bold text-sm uppercase tracking-wider text-white">{characterName}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDismiss(); }} className="p-2 text-muted-foreground hover:text-white transition-colors" title={t('common.close')}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex gap-2">
                    {!spent ? (
                        <DockButton onClick={onSpend} className="bg-white/10 border border-white/40 text-white hover:bg-white hover:text-black clip-corner-tr">
                            <svg width="16" height="16" viewBox="0 0 12 12" fill="none"><path d="M2 6.5L5 9.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            {t('play.spend')}
                        </DockButton>
                    ) : (
                        <DockButton onClick={onReactivate} className="bg-secondary/15 border border-secondary text-secondary hover:bg-secondary hover:text-black clip-corner-tr">
                            <RotateCw className="w-4 h-4" />
                            {t('play.reactivate')}
                        </DockButton>
                    )}
                    {canWound && (
                        <DockButton onClick={onWound} className="bg-accent/15 border border-accent text-accent hover:bg-accent hover:text-white clip-corner-br">
                            <Cross className="w-4 h-4" />
                            {t('play.wound')}
                        </DockButton>
                    )}
                    {wounded && (
                        <DockButton onClick={onHeal} className="bg-green-500/15 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black clip-corner-br">
                            <Heart className="w-4 h-4" />
                            {t('play.heal')}
                        </DockButton>
                    )}
                </div>
            </div>
        </div>
    );
}
