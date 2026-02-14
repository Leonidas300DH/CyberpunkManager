'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sword, Swords, TabletSmartphone, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'HQ', href: '/hq', icon: Home },
        { name: 'Characters', href: '/database', icon: Database },
        { name: 'Team Builder', href: '/match', icon: Swords },
        { name: 'Armory', href: '/armory', icon: Sword },
        { name: 'Play', href: '/play', icon: TabletSmartphone },
    ];

    return (
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
                                        ? "bg-primary text-black"
                                        : "text-muted-foreground hover:bg-muted hover:text-white"
                                )}
                            >
                                {/* Active Indicator: Angled Corner or Block */}
                                {isActive && (
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-black transform rotate-45 translate-x-1.5 -translate-y-1.5"></div>
                                )}

                                <Icon className={cn("w-5 h-5 z-10", isActive && "stroke-[2.5px]")} />

                                <span className={cn(
                                    "text-[9px] uppercase font-black tracking-widest z-10",
                                    isActive ? "opacity-100" : "opacity-70"
                                )}>
                                    {item.name}
                                </span>

                                {/* Glitch Overlay on Hover (Desktop) */}
                                <div className="absolute inset-0 bg-secondary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-200 pointer-events-none"></div>
                            </Link>
                        );
                    })}
                </div>

                {/* Decorative Bottom Line with "Scanner" scanline */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black overflow-hidden">
                    <div className="absolute inset-0 bg-secondary/30 animate-[pulse_2s_infinite]"></div>
                </div>
            </div>
        </nav>
    );
}
