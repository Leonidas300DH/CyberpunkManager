'use client';

import * as React from 'react';
import { useState, useCallback, useRef } from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import { useT } from '@/i18n';

// "SECURITY OVERRIDE" confirmation dialog — replaces window.confirm().
// destructive: red frame (deletions). warning: yellow frame (risky but reversible).

export interface CyberConfirmOptions {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'destructive' | 'warning';
}

interface CyberConfirmProps extends CyberConfirmOptions {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

const VARIANT_STYLES = {
    destructive: {
        border: 'border-accent',
        headerText: 'text-accent',
        headerKey: 'confirm.securityOverride' as const,
        button: 'bg-accent text-white hover:bg-accent/80 glow-accent',
    },
    warning: {
        border: 'border-primary',
        headerText: 'text-primary',
        headerKey: 'confirm.confirmationRequired' as const,
        button: 'bg-primary text-black hover:bg-primary/80 glow-primary',
    },
};

export function CyberConfirm({ open, onOpenChange, title, description, confirmLabel, cancelLabel, variant = 'destructive', onConfirm }: CyberConfirmProps) {
    const t = useT();
    const s = VARIANT_STYLES[variant];
    return (
        <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <AlertDialogPrimitive.Portal>
                <AlertDialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/80 scanlines data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
                <AlertDialogPrimitive.Content
                    className={`fixed top-[50%] left-[50%] z-[80] w-full max-w-sm translate-x-[-50%] translate-y-[-50%] bg-black border-2 ${s.border} clip-corner-tl-br p-0 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0`}
                >
                    <div className={`px-4 py-2 border-b border-border font-mono-tech text-[11px] uppercase tracking-[0.2em] ${s.headerText}`}>
                        ▌{t(s.headerKey)}
                    </div>
                    <div className="px-4 py-5">
                        <AlertDialogPrimitive.Title className="font-display font-bold text-xl uppercase tracking-wide text-white glitch-text" data-text={title}>
                            {title}
                        </AlertDialogPrimitive.Title>
                        {description && (
                            <AlertDialogPrimitive.Description className="mt-2 font-mono-tech text-xs text-muted-foreground">
                                {description}
                            </AlertDialogPrimitive.Description>
                        )}
                    </div>
                    <div className="flex gap-px border-t border-border">
                        <AlertDialogPrimitive.Cancel asChild>
                            <button className="flex-1 px-4 py-3 font-mono-tech text-xs uppercase tracking-widest text-muted-foreground bg-surface-dark hover:text-white hover:bg-black transition-colors">
                                {cancelLabel ?? t('confirm.abort')}
                            </button>
                        </AlertDialogPrimitive.Cancel>
                        <AlertDialogPrimitive.Action asChild>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 px-4 py-3 font-mono-tech text-xs uppercase tracking-widest font-bold clip-corner-br transition-colors ${s.button}`}
                            >
                                {confirmLabel ?? t('common.confirm')}
                            </button>
                        </AlertDialogPrimitive.Action>
                    </div>
                </AlertDialogPrimitive.Content>
            </AlertDialogPrimitive.Portal>
        </AlertDialogPrimitive.Root>
    );
}

/**
 * Drop-in replacement for window.confirm():
 *   const { confirm, confirmDialog } = useCyberConfirm();
 *   ...render {confirmDialog} once...
 *   if (!(await confirm({ title: weapon.name, variant: 'destructive' }))) return;
 */
export function useCyberConfirm() {
    const [state, setState] = useState<CyberConfirmOptions | null>(null);
    const resolveRef = useRef<(ok: boolean) => void>(null);

    const confirm = useCallback((opts: CyberConfirmOptions): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
            setState(opts);
        });
    }, []);

    const settle = useCallback((ok: boolean) => {
        resolveRef.current?.(ok);
        resolveRef.current = null;
        setState(null);
    }, []);

    const confirmDialog = state ? (
        <CyberConfirm
            open
            onOpenChange={(open) => { if (!open) settle(false); }}
            onConfirm={() => settle(true)}
            {...state}
        />
    ) : null;

    return { confirm, confirmDialog };
}
