'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';

/**
 * Draggable capsule wrapper — inline <span> for flex-wrap layouts.
 * When disabled, renders children unwrapped (no drag).
 */
export function DraggableCapsule({ id, disabled, children }: { id: string; disabled?: boolean; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled });
    if (disabled) return <>{children}</>;
    return (
        <span
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`touch-none cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30' : ''}`}
        >
            {children}
        </span>
    );
}

/**
 * Drop zone for the "Your X" owned section.
 * Shows a ring highlight when an item is hovering over it.
 */
export function OwnedDropZone({ children }: { children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id: 'owned-zone' });
    return (
        <div
            ref={setNodeRef}
            className={`transition-all rounded-lg ${isOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
        >
            {children}
        </div>
    );
}

/**
 * Trash/sell drop zone — appears only when dragging an owned item.
 */
export function TrashZone({ visible, label = 'Drop to sell' }: { visible: boolean; label?: string }) {
    const { setNodeRef, isOver } = useDroppable({ id: 'trash-zone' });
    if (!visible) return null;
    return (
        <div
            ref={setNodeRef}
            className={`flex items-center justify-center gap-2 py-3 mt-3 border-2 border-dashed rounded transition-all font-mono-tech text-xs uppercase tracking-widest ${
                isOver ? 'border-accent bg-accent/15 text-accent' : 'border-border text-muted-foreground'
            }`}
        >
            <Trash2 className="w-4 h-4" /> {label}
        </div>
    );
}
