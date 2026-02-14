'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Faction } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageInput } from '@/components/ui/image-input';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Edit } from 'lucide-react';

export function FactionsTab() {
    const { catalog, setCatalog } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [editingFaction, setEditingFaction] = useState<Faction | null>(null);
    const [formData, setFormData] = useState<Partial<Faction>>({});

    const handleSave = () => {
        const newFactions = [...catalog.factions];
        if (editingFaction) {
            const index = newFactions.findIndex(f => f.id === editingFaction.id);
            if (index !== -1) {
                newFactions[index] = { ...editingFaction, ...formData } as Faction;
            }
        } else {
            const newFaction: Faction = {
                id: uuidv4(),
                name: formData.name || 'New Faction',
                imageUrl: formData.imageUrl,
            };
            newFactions.push(newFaction);
        }
        setCatalog({ ...catalog, factions: newFactions });
        setIsOpen(false);
        setEditingFaction(null);
        setFormData({});
    };

    const handleDelete = (id: string) => {
        const newFactions = catalog.factions.filter(f => f.id !== id);
        setCatalog({ ...catalog, factions: newFactions });
    };

    const openEdit = (faction: Faction) => {
        setEditingFaction(faction);
        setFormData(faction);
        setIsOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Factions</h2>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingFaction(null); setFormData({}); }}>
                            <Plus className="w-4 h-4 mr-2" /> Add Faction
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingFaction ? 'Edit Faction' : 'New Faction'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Faction Name"
                                />
                            </div>
                            <ImageInput
                                value={formData.imageUrl || ''}
                                onChange={(val) => setFormData({ ...formData, imageUrl: val })}
                            />
                            <Button onClick={handleSave} className="w-full">Save</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {catalog.factions.map((faction) => (
                    <Card key={faction.id} className="overflow-hidden">
                        <div className="aspect-square w-full relative bg-muted">
                            {faction.imageUrl ? (
                                <img src={faction.imageUrl} alt={faction.name} className="object-cover w-full h-full" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                            )}
                        </div>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm truncate">{faction.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(faction)}>
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(faction.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
