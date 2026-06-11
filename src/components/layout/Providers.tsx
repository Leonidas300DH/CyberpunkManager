'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { SyncProvider } from '@/components/layout/SyncProvider';
import { BootSequence } from '@/components/layout/BootSequence';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SyncProvider />
            {children}
            <BootSequence />
            <Toaster position="top-center" theme="dark" />
        </AuthProvider>
    );
}
