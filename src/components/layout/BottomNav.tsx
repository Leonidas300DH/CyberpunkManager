'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sword, Swords, TabletSmartphone, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'HQ', href: '/hq', icon: Home },
        { name: 'Armory', href: '/armory', icon: Sword },
        { name: 'Match', href: '/match', icon: Swords },
        { name: 'Play', href: '/play', icon: TabletSmartphone },
        { name: 'DB', href: '/database', icon: Database },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300">
            {/* Glossy Backdrop with border-t highlight */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"></div>

            <div className="relative flex justify-around items-center h-20 pb-4">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 relative",
                                isActive
                                    ? "text-primary -translate-y-1"
                                    : "text-muted-foreground hover:text-foreground hover:-translate-y-0.5"
                            )}
                        >
                            {/* Active Glow Indicator */}
                            {isActive && (
                                <div className="absolute top-1 w-8 h-8 bg-primary/20 blur-xl rounded-full animate-pulse pointer-events-none" />
                            )}

                            <Icon className={cn("w-6 h-6 transition-transform duration-300", isActive && "drop-shadow-[0_0_8px_rgba(252,238,10,0.6)]")} />

                            <span className={cn(
                                "text-[9px] uppercase tracking-widest font-bold transition-opacity duration-300",
                                isActive ? "opacity-100 text-primary" : "opacity-70 group-hover:opacity-100"
                            )}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
