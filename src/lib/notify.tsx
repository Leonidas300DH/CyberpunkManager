'use client';

import { toast } from 'sonner';

// Terminal-style toasts ("Night City Official"). Uses toast.custom so the
// default sonner styling/toastOptions never apply — all visuals live here.

type NotifyVariant = 'info' | 'success' | 'destructive';

const VARIANT_STYLES: Record<NotifyVariant, { border: string; text: string; glow: string }> = {
    info:        { border: 'border-secondary', text: 'text-secondary', glow: 'glow-secondary' },
    success:     { border: 'border-primary',   text: 'text-primary',   glow: 'glow-primary' },
    destructive: { border: 'border-accent',    text: 'text-accent',    glow: 'glow-accent' },
};

export function notify(message: string, opts?: { variant?: NotifyVariant; description?: string; duration?: number }) {
    const variant = opts?.variant ?? 'info';
    const s = VARIANT_STYLES[variant];
    toast.custom(() => (
        <div className={`bg-black/95 border ${s.border} ${s.glow} clip-corner-br px-4 py-3 min-w-[260px]`}>
            <div className={`font-mono-tech text-xs uppercase tracking-wider ${s.text}`}>
                <span className="opacity-60">&gt;&nbsp;</span>{message}
            </div>
            {opts?.description && (
                <div className="font-mono-tech text-[10px] text-white/60 mt-1 pl-3">{opts.description}</div>
            )}
        </div>
    ), { duration: opts?.duration ?? 3500 });
}

export const notifyInfo = (message: string, description?: string) => notify(message, { variant: 'info', description });
export const notifySuccess = (message: string, description?: string) => notify(message, { variant: 'success', description });
export const notifyError = (message: string, description?: string) => notify(message, { variant: 'destructive', description, duration: 5000 });
