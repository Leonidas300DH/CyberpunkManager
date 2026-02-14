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
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-[10px] uppercase tracking-wider font-semibold">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
