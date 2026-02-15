'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const MIN_COLS = 2;
const MAX_COLS = 6;
const MIN_SCALE = 80;
const MAX_SCALE = 130;
const SCALE_STEP = 5;

export function DisplaySettings({ direction = 'down' }: { direction?: 'up' | 'down' }) {
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { displaySettings, setDisplaySettings } = useStore();
    const { cardColumns, fontScale } = displaySettings;

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (
                panelRef.current && !panelRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const isNavStyle = direction === 'up';

    return (
        <div className={cn("relative", isNavStyle && "w-full h-full")}>
            <button
                ref={buttonRef}
                onClick={() => setOpen(v => !v)}
                className={cn(
                    isNavStyle
                        ? cn(
                            "w-full h-full flex flex-col items-center justify-center space-y-1 transition-all duration-200 relative group overflow-hidden",
                            open
                                ? "bg-secondary/20 text-secondary"
                                : "text-muted-foreground hover:bg-muted hover:text-white"
                        )
                        : cn(
                            "p-2 border border-border clip-corner-tr transition-colors",
                            open
                                ? 'bg-secondary text-black'
                                : 'bg-surface-dark text-muted-foreground hover:text-secondary hover:border-secondary'
                        )
                )}
                title="Display settings"
            >
                <Settings className={cn("w-5 h-5", isNavStyle && "z-10")} />
                {isNavStyle && (
                    <span className="text-[9px] uppercase font-black tracking-widest z-10 opacity-70">
                        Settings
                    </span>
                )}
            </button>

            {open && (
                <div
                    ref={panelRef}
                    className={`absolute z-50 w-80 bg-surface-dark border border-border clip-corner-tl-br p-4 space-y-4 ${
                        direction === 'up'
                            ? 'bottom-full mb-2 right-0'
                            : 'top-full mt-2 right-0'
                    }`}
                >
                    {/* Cards per row */}
                    <div>
                        <label className="font-mono-tech text-xs text-muted-foreground uppercase tracking-widest block mb-2">
                            Cards per row
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setDisplaySettings({ cardColumns: Math.max(MIN_COLS, cardColumns - 1) })}
                                disabled={cardColumns <= MIN_COLS}
                                className="w-8 h-8 border border-border bg-black text-white font-bold text-lg flex items-center justify-center clip-corner-tr disabled:opacity-30 hover:border-secondary hover:text-secondary transition-colors"
                            >
                                -
                            </button>
                            <span className="font-display text-xl text-white w-8 text-center">{cardColumns}</span>
                            <button
                                onClick={() => setDisplaySettings({ cardColumns: Math.min(MAX_COLS, cardColumns + 1) })}
                                disabled={cardColumns >= MAX_COLS}
                                className="w-8 h-8 border border-border bg-black text-white font-bold text-lg flex items-center justify-center clip-corner-tr disabled:opacity-30 hover:border-secondary hover:text-secondary transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Font scale */}
                    <div>
                        <label className="font-mono-tech text-xs text-muted-foreground uppercase tracking-widest block mb-2">
                            Card scale
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setDisplaySettings({ fontScale: Math.max(MIN_SCALE, fontScale - SCALE_STEP) })}
                                disabled={fontScale <= MIN_SCALE}
                                className="px-2 h-8 border border-border bg-black text-white font-mono-tech text-sm flex items-center justify-center clip-corner-tr disabled:opacity-30 hover:border-secondary hover:text-secondary transition-colors"
                            >
                                A-
                            </button>
                            <span className="font-display text-xl text-white w-12 text-center">{fontScale}%</span>
                            <button
                                onClick={() => setDisplaySettings({ fontScale: Math.min(MAX_SCALE, fontScale + SCALE_STEP) })}
                                disabled={fontScale >= MAX_SCALE}
                                className="px-2 h-8 border border-border bg-black text-white font-mono-tech text-sm flex items-center justify-center clip-corner-tr disabled:opacity-30 hover:border-secondary hover:text-secondary transition-colors"
                            >
                                A+
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
