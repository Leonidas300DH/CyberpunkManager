'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { SyncProvider } from '@/components/layout/SyncProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SyncProvider />
            {children}
        </AuthProvider>
    );
}
