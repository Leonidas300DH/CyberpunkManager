'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Swords, TabletSmartphone, Database, Cloud, CloudOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DisplaySettings } from '@/components/ui/DisplaySettings';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/store/useStore';
import { AuthDialog } from '@/components/auth/AuthDialog';

export function BottomNav() {
    const pathname = usePathname();
    const { user, loading, signOut } = useAuth();
    const [authOpen, setAuthOpen] = useState(false);
    const campaigns = useStore((s) => s.campaigns);
    const syncStatus = useStore((s) => s.syncStatus);
    const syncError = useStore((s) => s.syncError);

    const hasCampaigns = campaigns.length > 0;

    const navItems = [
        { name: 'HQ', href: '/hq', icon: Home, bg: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/menus/HQ.png' },
        { name: 'Team Builder', href: '/match', icon: Swords, bg: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/menus/team.png' },
        { name: 'Play', href: '/play', icon: TabletSmartphone, bg: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/menus/battle.png' },
        { name: 'Database', href: '/database', icon: Database, bg: 'https://nknlxlmmliccsfsndnba.supabase.co/storage/v1/object/public/app-images/menus/database.png' },
    ];

    // ─── Sync button rendering ────────────────────────────────────────
    function renderSyncButton() {
        // Loading auth
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="w-5 h-5 border-2 border-muted-foreground/40 border-t-secondary rounded-full animate-spin" />
                </div>
            );
        }

        // Authenticated
        if (user) {
            // Syncing spinner
            if (syncStatus === 'syncing') {
                return (
                    <button
                        className="w-full h-full flex flex-col items-center justify-center space-y-1 text-muted-foreground transition-all duration-200 relative group overflow-hidden"
                        title="Syncing..."
                    >
                        <div className="relative z-10">
                            <div className="w-5 h-5 border-2 border-green-400/40 border-t-green-400 rounded-full animate-spin" />
                        </div>
                        <span className="text-[9px] uppercase font-black tracking-widest z-10 opacity-70 text-green-400">
                            Syncing
                        </span>
                    </button>
                );
            }

            // Sync error
            if (syncStatus === 'error') {
                return (
                    <button
                        onClick={() => signOut()}
                        className="w-full h-full flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:bg-muted hover:text-white transition-all duration-200 relative group overflow-hidden"
                        title={`Sync error: ${syncError ?? 'Unknown'}\nClick to sign out`}
                    >
                        <div className="relative z-10">
                            <AlertTriangle className="w-5 h-5 text-orange-400" />
                        </div>
                        <span className="text-[9px] uppercase font-black tracking-widest z-10 opacity-70 text-orange-400">
                            Sync Error
                        </span>
                        <div className="absolute inset-0 bg-secondary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-200 pointer-events-none"></div>
                    </button>
                );
            }

            // Synced (default when authenticated)
            return (
                <button
                    onClick={() => signOut()}
                    className="w-full h-full flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:bg-muted hover:text-white transition-all duration-200 relative group overflow-hidden"
                    title={`Signed in as ${user.email}\nClick to sign out`}
                >
                    <div className="relative z-10">
                        <Cloud className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-[9px] uppercase font-black tracking-widest z-10 opacity-70 text-green-400">
                        Synced
                    </span>
                    <div className="absolute inset-0 bg-secondary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-200 pointer-events-none"></div>
                </button>
            );
        }

        // Not authenticated — red warning if campaigns exist
        if (hasCampaigns) {
            return (
                <button
                    onClick={() => setAuthOpen(true)}
                    className="w-full h-full flex flex-col items-center justify-center space-y-1 text-accent hover:bg-muted transition-all duration-200 relative group overflow-hidden"
                    title="Your campaigns are stored locally only. Sign in to save them to the cloud."
                >
                    <CloudOff className="w-5 h-5 z-10" />
                    <span className="text-[9px] uppercase font-black tracking-widest z-10 opacity-90">
                        Not Saved
                    </span>
                    <div className="absolute inset-0 bg-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-200 pointer-events-none"></div>
                </button>
            );
        }

        // Not authenticated, no campaigns — neutral login
        return (
            <button
                onClick={() => setAuthOpen(true)}
                className="w-full h-full flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:bg-muted hover:text-white transition-all duration-200 relative group overflow-hidden"
            >
                <CloudOff className="w-5 h-5 z-10" />
                <span className="text-[9px] uppercase font-black tracking-widest z-10 opacity-70">
                    Login
                </span>
                <div className="absolute inset-0 bg-secondary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-200 pointer-events-none"></div>
            </button>
        );
    }

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-50">
                {/* Main Bar - Solid Black with Top Border Cyan */}
                <div className="bg-background border-t-2 border-secondary relative h-20">
                    <div className="flex justify-around items-stretch h-full">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex-1 flex flex-col items-center justify-center space-y-1 transition-all duration-200 relative group overflow-hidden",
                                        isActive
                                            ? "bg-primary/40 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-white"
                                    )}
                                >
                                    {/* Background image */}
                                    <img
                                        src={item.bg}
                                        alt=""
                                        className={cn(
                                            "absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-200",
                                            isActive ? "opacity-50" : "opacity-15 group-hover:opacity-25"
                                        )}
                                    />
                                    {/* Gradient overlay for text readability */}
                                    <div className={cn(
                                        "absolute inset-0 pointer-events-none",
                                        isActive
                                            ? "bg-gradient-to-t from-primary/30 via-transparent to-transparent"
                                            : "bg-gradient-to-t from-black/80 via-black/40 to-black/20"
                                    )} />

                                    {/* Active Indicator: Angled Corner or Block */}
                                    {isActive && (
                                        <div className="absolute top-0 right-0 w-3 h-3 bg-black transform rotate-45 translate-x-1.5 -translate-y-1.5 z-20"></div>
                                    )}

                                    <Icon className={cn("w-5 h-5 z-10", isActive && "stroke-[2.5px]")} />

                                    <span className={cn(
                                        "text-[9px] uppercase font-black tracking-widest z-10",
                                        isActive ? "opacity-100" : "opacity-70"
                                    )}>
                                        {item.name}
                                    </span>

                                </Link>
                            );
                        })}

                        {/* User / Auth / Sync button */}
                        <div className="flex-1 flex flex-col items-center justify-center relative">
                            {renderSyncButton()}
                        </div>

                        {/* Settings - always visible, opens upward */}
                        <div className="flex-1 flex flex-col items-center justify-center relative">
                            <DisplaySettings direction="up" />
                        </div>
                    </div>

                    {/* Decorative Bottom Line with "Scanner" scanline */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black overflow-hidden">
                        <div className="absolute inset-0 bg-secondary/30 animate-[pulse_2s_infinite]"></div>
                    </div>
                </div>
            </nav>
            <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
        </>
    );
}
