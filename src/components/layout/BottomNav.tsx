'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Swords, TabletSmartphone, Database, Cloud, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DisplaySettings } from '@/components/ui/DisplaySettings';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from '@/components/auth/AuthDialog';

export function BottomNav() {
    const pathname = usePathname();
    const { user, loading, signOut } = useAuth();
    const [authOpen, setAuthOpen] = useState(false);

    const navItems = [
        { name: 'HQ', href: '/hq', icon: Home, bg: '/images/Menus/HQ.png' },
        { name: 'Team Builder', href: '/match', icon: Swords, bg: '/images/Menus/team.png' },
        { name: 'Play', href: '/play', icon: TabletSmartphone, bg: '/images/Menus/battle.png' },
        { name: 'Database', href: '/database', icon: Database, bg: '/images/Menus/database.png' },
    ];

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

                        {/* User / Auth button */}
                        <div className="flex-1 flex flex-col items-center justify-center relative">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center space-y-1">
                                    <div className="w-5 h-5 border-2 border-muted-foreground/40 border-t-secondary rounded-full animate-spin" />
                                </div>
                            ) : user ? (
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
                            ) : (
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
                            )}
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
