'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ItemCard, ItemCategory } from '@/types';

const CATEGORY_STYLES: Record<ItemCategory, { border: string; text: string; bg: string; glow: string }> = {
    Gear: { border: 'border-secondary', text: 'text-secondary', bg: 'bg-secondary', glow: 'group-hover:shadow-[0_0_10px_rgba(0,240,255,0.3)]' },
    Program: { border: 'border-cyber-purple', text: 'text-cyber-purple', bg: 'bg-cyber-purple', glow: 'group-hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]' },
    Loot: { border: 'border-primary', text: 'text-primary', bg: 'bg-primary', glow: 'group-hover:shadow-[0_0_10px_rgba(252,238,10,0.3)]' },
    Objective: { border: 'border-cyber-green', text: 'text-cyber-green', bg: 'bg-cyber-green', glow: 'group-hover:shadow-[0_0_10px_rgba(57,255,20,0.3)]' },
};

export function ItemsTab() {
    const { catalog } = useStore();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'all'>('all');

    const categories: ItemCategory[] = ['Gear', 'Program', 'Loot', 'Objective'];

    const filteredItems = catalog.items.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()));
        const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    const itemsByCategory = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, ItemCard[]>);

    return (
        <div className="space-y-6">
            {/* Search & Category Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-surface-dark/50 p-4 border border-border">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="SEARCH ITEMS..."
                    className="bg-black border border-border px-4 py-2 font-mono-tech text-sm uppercase text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none w-full md:w-64"
                />
                <div className="flex gap-2 font-mono-tech text-xs flex-wrap">
                    <button
                        onClick={() => setCategoryFilter('all')}
                        className={`px-4 py-2 font-bold uppercase tracking-wider transition-colors ${
                            categoryFilter === 'all' ? 'bg-primary text-black' : 'border border-border text-muted-foreground hover:border-primary hover:text-primary'
                        }`}
                    >
                        All Items
                    </button>
                    {categories.map(cat => {
                        const style = CATEGORY_STYLES[cat];
                        return (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-2 font-bold uppercase tracking-wider transition-colors ${
                                    categoryFilter === cat
                                        ? `${style.bg} text-black`
                                        : `border border-border text-muted-foreground hover:${style.border} hover:${style.text}`
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Items Grid */}
            {Object.entries(itemsByCategory).map(([category, items]) => {
                const style = CATEGORY_STYLES[category as ItemCategory];

                return (
                    <div key={category}>
                        {/* Category Header */}
                        <div className={`border-l-4 ${style.border} pl-4 mb-4`}>
                            <h3 className={`font-display text-2xl font-bold uppercase tracking-wider ${style.text}`}>{category}</h3>
                            <span className="font-mono-tech text-xs text-muted-foreground uppercase tracking-widest">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {items.map(item => (
                                <div key={item.id} className={`group bg-surface-dark border border-border hover:${style.border} transition-all ${style.glow} relative flex overflow-hidden`}>
                                    {/* Colored sidebar */}
                                    <div className={`w-2 shrink-0 ${style.bg}`} />

                                    <div className="flex-1 flex flex-col">
                                        {/* Item Header */}
                                        <div className="bg-black p-3 border-b border-border flex justify-between items-start">
                                            <div>
                                                <h4 className="font-display text-lg text-white uppercase tracking-tight leading-tight">{item.name}</h4>
                                                <div className="flex gap-2 mt-1 flex-wrap">
                                                    {item.keywords.map((kw, i) => (
                                                        <span key={i} className="text-[10px] font-mono-tech text-muted-foreground border border-border px-1 uppercase">{kw}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-3">
                                                <div className={`font-display font-bold text-lg ${style.text}`}>{item.costEB}</div>
                                                <div className="text-[10px] font-mono-tech text-muted-foreground">EB</div>
                                            </div>
                                        </div>

                                        {/* Item Body */}
                                        <div className="p-3 flex-1">
                                            {item.passiveRules && (
                                                <div className={`bg-black/50 border-l-2 ${style.border} pl-2 py-1 mb-2`}>
                                                    <p className="text-xs font-mono-tech text-muted-foreground leading-tight">{item.passiveRules}</p>
                                                </div>
                                            )}

                                            {item.grantedActions.length > 0 && (
                                                <div className="space-y-1">
                                                    {item.grantedActions.map(action => (
                                                        <div key={action.id} className="flex justify-between items-center text-[10px] border-t border-border pt-1">
                                                            <span className="font-mono-tech text-white uppercase">{action.name}</span>
                                                            <span className={`font-mono-tech ${style.text}`}>{action.range}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Item Footer */}
                                        <div className="px-3 pb-3 flex justify-between items-center">
                                            {item.rarity < 99 && (
                                                <span className="text-[10px] font-mono-tech text-muted-foreground">RAR.{item.rarity}</span>
                                            )}
                                            {item.reqStreetCred > 0 && (
                                                <span className="text-[10px] font-mono-tech text-secondary">SC {item.reqStreetCred}+</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {filteredItems.length === 0 && (
                <div className="border border-dashed border-border p-8 text-center text-muted-foreground font-mono-tech uppercase text-xs tracking-widest">
                    No items found. Add items to your catalog.
                </div>
            )}
        </div>
    );
}
