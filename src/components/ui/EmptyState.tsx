'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Unified "no data / no results" block — Night City styling.
// Pattern lifted from hq/page.tsx (No Active Campaign) and ActiveMatchView (no active match).

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    cta?: { label: string; onClick: () => void } | React.ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, cta, className }: EmptyStateProps) {
    return (
        <div className={cn('border-2 border-dashed border-border bg-black/50 clip-corner-tl-br p-12 flex flex-col items-center text-center gap-4', className)}>
            <div className="h-16 w-16 clip-corner-tr bg-surface-dark border border-border flex items-center justify-center">
                <Icon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-display font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
            {description && (
                <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest max-w-sm">{description}</p>
            )}
            {cta && (
                React.isValidElement(cta) || cta == null || typeof cta !== 'object' || !('label' in cta)
                    ? (cta as React.ReactNode)
                    : (
                        <button
                            onClick={(cta as { label: string; onClick: () => void }).onClick}
                            className="mt-2 px-6 py-2 bg-primary text-black font-display font-bold uppercase tracking-wider text-sm clip-corner-br hover:bg-primary/80 transition-colors"
                        >
                            {(cta as { label: string; onClick: () => void }).label}
                        </button>
                    )
            )}
        </div>
    );
}
