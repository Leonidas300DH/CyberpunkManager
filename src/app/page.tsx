'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
    const { user, loading, signInWithGoogle } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/hq');
        }
    }, [user, loading, router]);

    // Already logged in → redirect (handled by useEffect)
    if (loading || user) {
        return (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-40 overflow-hidden">
            {/* Video background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/video/Static_wide_shot_1080p_202602151716.mp4" type="video/mp4" />
            </video>

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
                {/* Logo / Title */}
                <div className="text-center mb-12">
                    <h1 className="font-display text-5xl sm:text-7xl text-primary uppercase tracking-wider leading-none">
                        Combat Zone
                    </h1>
                    <p className="font-display text-xl sm:text-2xl text-secondary uppercase tracking-[0.3em] mt-2">
                        Companion
                    </p>
                    <p className="font-body text-sm text-muted-foreground mt-4 max-w-md mx-auto">
                        Unofficial companion app for Cyberpunk Red: Combat Zone
                    </p>
                </div>

                {/* Google Sign In */}
                <button
                    onClick={() => signInWithGoogle()}
                    className="flex items-center gap-3 px-8 py-3 bg-white text-black font-body text-base font-semibold rounded-sm clip-corner-tr hover:bg-gray-100 transition-colors shadow-lg shadow-primary/20"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                </button>

                {/* Skip / Offline */}
                <button
                    onClick={() => router.push('/hq')}
                    className="mt-6 text-muted-foreground hover:text-white text-sm font-body underline underline-offset-4 transition-colors"
                >
                    Continue without account
                </button>
            </div>
        </div>
    );
}
