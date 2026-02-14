'use client';

import { Campaign } from '@/types';
import { useStore } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart } from 'lucide-react';

interface StashListProps {
    campaign: Campaign;
}

export function StashList({ campaign }: StashListProps) {
    const { catalog } = useStore();

    const getItem = (itemId: string) => catalog.items.find(i => i.id === itemId);

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button size="sm"><ShoppingCart className="w-3 h-3 mr-1" /> Buy Items</Button>
            </div>
            {campaign.hqStash.length === 0 && <div className="text-center text-muted-foreground py-4">Stash is empty.</div>}

            <div className="grid grid-cols-2 gap-2">
                {campaign.hqStash.map((itemId, idx) => {
                    const item = getItem(itemId);
                    if (!item) return null;
                    return (
                        <Card key={`${itemId}-${idx}`} className="bg-card/50">
                            <CardContent className="p-3">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-xs line-clamp-1">{item.name}</span>
                                    <span className="text-[10px] text-warning whitespace-nowrap">{item.costEB} EB</span>
                                </div>
                                <Badge variant="outline" className="text-[10px] h-5">{item.category}</Badge>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
