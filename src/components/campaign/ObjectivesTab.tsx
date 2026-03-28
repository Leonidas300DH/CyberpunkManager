'use client';

import { useT } from '@/i18n';

export function ObjectivesTab() {
    const t = useT();
    return (
        <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
            <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">{t('hq.objectives')}</h3>
            <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">{t('hq.objectivesComingSoon')}</p>
        </div>
    );
}
