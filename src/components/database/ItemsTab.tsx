'use client';

import { useStore } from '@/store/useStore';
import { ItemCard, ItemCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Shield, Zap, Box, Hash } from 'lucide-react';

export function ItemsTab() {
    const { catalog } = useStore();

    const itemsByCategory = catalog.items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<ItemCategory, ItemCard[]>);

    const getCategoryColor = (cat: ItemCategory) => {
        switch (cat) {
            case 'Gear': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'Program': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
            case 'Loot': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'Objective': return 'bg-green-500/20 text-green-400 border-green-500/50';
            default: return '';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> Add Item (Coming Soon)
                </Button>
            </div>

            {Object.entries(itemsByCategory).map(([category, items]) => (
                <div key={category} className="space-y-2">
                    <h3 className="text-lg font-bold text-primary border-b border-border pb-1">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {items.map(item => (
                            <Card key={item.id} className="bg-card/50 flex flex-row overflow-hidden">
                                <div className="w-20 bg-muted shrink-0 relative">
                                    {item.imageUrl ? <img src={item.imageUrl} className="object-cover w-full h-full" /> : <div className="flex items-center justify-center h-full"><Box className="w-6 h-6 text-muted-foreground" /></div>}
                                </div>
                                <div className="flex-1">
                                    <CardHeader className="p-3 pb-1">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                                            <span className="text-xs font-mono text-warning whitespace-nowrap">{item.costEB} EB</span>
                                        </div>
                                        <div className="flex gap-1 flex-wrap mt-1">
                                            <Badge variant="outline" className={`text-[10px] px-1 h-5 ${getCategoryColor(item.category)}`}>{item.category}</Badge>
                                            {item.rarity < 99 && <Badge variant="secondary" className="text-[10px] px-1 h-5">Rarity {item.rarity}</Badge>}
                                            {item.reqStreetCred > 0 && <Badge variant="secondary" className="text-[10px] px-1 h-5">SC {item.reqStreetCred}+</Badge>}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-1 text-xs text-muted-foreground">
                                        {item.keywords?.length > 0 && <div>{item.keywords.join(', ')}</div>}
                                        <div className="line-clamp-2">{item.passiveRules}</div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
