'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Campaign } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from 'uuid';

interface NewCampaignDialogProps {
    onCampaignCreated?: (id: string) => void;
    trigger?: React.ReactNode;
}

export function NewCampaignDialog({ onCampaignCreated, trigger }: NewCampaignDialogProps) {
    const { catalog, addCampaign } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [factionId, setFactionId] = useState('');

    const handleCreate = () => {
        if (!name || !factionId) return;

        const newCampaign: Campaign = {
            id: uuidv4(),
            name,
            factionId,
            ebBank: 500, // Starting Gold (Standard is usually 500 or determined by scenario, let's start with 500)
            hqRoster: [],
            hqStash: [],
            completedObjectives: []
        };

        addCampaign(newCampaign);
        setIsOpen(false);
        setName('');
        setFactionId('');
        if (onCampaignCreated) onCampaignCreated(newCampaign.id);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>New Campaign</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start New Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Campaign Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Gang's Rise"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Faction</Label>
                        <Select onValueChange={setFactionId} value={factionId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Faction" />
                            </SelectTrigger>
                            <SelectContent>
                                {catalog.factions.map(f => (
                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleCreate} disabled={!name || !factionId} className="w-full">
                        Start Campaign
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
