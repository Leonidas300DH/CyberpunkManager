'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { SyncProvider } from '@/components/layout/SyncProvider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SyncProvider />
            {children}
            <Toaster position="top-center" theme="dark" />
        </AuthProvider>
    );
}
