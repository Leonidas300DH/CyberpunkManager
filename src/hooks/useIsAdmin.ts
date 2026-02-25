'use client';

import { useAuth } from '@/contexts/AuthContext';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export function useIsAdmin(): boolean {
    // TODO: remove localhost bypass before deploy
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') return true;
    const { user } = useAuth();
    if (!user || !ADMIN_EMAIL) return false;
    return user.email === ADMIN_EMAIL;
}
