'use client';

import { Campaign, ItemCategory } from '@/types';
import { useStore } from '@/store/useStore';
import { ShoppingCart } from 'lucide-react';

interface StashListProps {
    campaign: Campaign;
}

const CATEGORY_COLORS: Record<ItemCategory, string> = {
    Gear: 'bg-secondary',
    Program: 'bg-cyber-purple',
    Loot: 'bg-primary',
    Objective: 'bg-cyber-green',
};

export function StashList({ campaign }: StashListProps) {
    const { catalog } = useStore();
    const getItem = (itemId: string) => catalog.items.find(i => i.id === itemId);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="border-l-2 border-secondary pl-3">
                    <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">Equipment Stash</h3>
                    <span className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">
                        {campaign.hqStash.length} item{campaign.hqStash.length !== 1 ? 's' : ''} stored
                    </span>
                </div>
                <button className="bg-secondary hover:bg-white text-black font-display font-bold uppercase tracking-wider px-4 py-2 clip-corner-br transition-colors flex items-center gap-2 text-sm">
                    <ShoppingCart className="w-4 h-4" /> Buy Items
                </button>
            </div>

            {/* Empty State */}
            {campaign.hqStash.length === 0 && (
                <div className="border-2 border-dashed border-border bg-black/50 p-12 text-center clip-corner-tl-br">
                    <h3 className="text-xl font-display font-bold uppercase text-muted-foreground mb-2">Stash Empty</h3>
                    <p className="text-xs font-mono-tech text-muted-foreground uppercase tracking-widest">Acquire gear from the Armory.</p>
                </div>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {campaign.hqStash.map((itemId, idx) => {
                    const item = getItem(itemId);
                    if (!item) return null;
                    const catColor = CATEGORY_COLORS[item.category] || 'bg-border';

                    return (
                        <div key={`${itemId}-${idx}`} className="group bg-surface-dark border border-border hover:border-secondary transition-all flex overflow-hidden">
                            {/* Colored sidebar */}
                            <div className={`w-2 shrink-0 ${catColor}`} />

                            <div className="flex-1 p-3">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-display text-sm text-white uppercase tracking-tight leading-tight">{item.name}</h4>
                                    <span className="text-xs font-mono-tech text-primary font-bold ml-2 shrink-0">{item.costEB} EB</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-mono-tech text-muted-foreground border border-border px-1 uppercase">{item.category}</span>
                                    {item.keywords.slice(0, 2).map((kw, i) => (
                                        <span key={i} className="text-[10px] font-mono-tech text-muted-foreground uppercase">{kw}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
