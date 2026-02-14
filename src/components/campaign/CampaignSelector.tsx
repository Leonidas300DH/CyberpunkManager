'use client';

import { useStore } from '@/store/useStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewCampaignDialog } from './NewCampaignDialog';

interface CampaignSelectorProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function CampaignSelector({ selectedId, onSelect }: CampaignSelectorProps) {
    const { campaigns } = useStore();

    return (
        <div className="flex gap-2">
            <Select value={selectedId || ''} onValueChange={onSelect}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Campaign" />
                </SelectTrigger>
                <SelectContent>
                    {campaigns.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <NewCampaignDialog />
        </div>
    );
}
