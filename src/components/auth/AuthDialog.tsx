'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
    const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const fn = mode === 'login' ? signInWithEmail : signUpWithEmail;
        const { error } = await fn(email, password);

        if (error) {
            setError(error);
            setLoading(false);
        } else {
            if (mode === 'signup') {
                setError(null);
                setMode('login');
                setLoading(false);
                // Show a success hint
                setError('Account created! Check your email to confirm, then log in.');
            } else {
                onOpenChange(false);
                setLoading(false);
            }
        }
    };

    const handleGoogle = async () => {
        setError(null);
        await signInWithGoogle();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-black border-2 border-primary clip-corner-tl-br max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl text-primary uppercase tracking-wider">
                        {mode === 'login' ? 'Jack In' : 'Register'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-body text-sm">
                        {mode === 'login'
                            ? 'Sign in to sync your campaigns across devices.'
                            : 'Create an account to save your data in the cloud.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div>
                        <label className="font-mono-tech text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-10 px-3 bg-surface-dark border border-border text-white font-body text-sm clip-corner-tr focus:border-primary focus:outline-none transition-colors"
                            placeholder="runner@nightcity.net"
                        />
                    </div>
                    <div>
                        <label className="font-mono-tech text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-10 px-3 bg-surface-dark border border-border text-white font-body text-sm clip-corner-tr focus:border-primary focus:outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className={`text-xs font-body ${error.includes('created') ? 'text-green-400' : 'text-accent'}`}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 bg-primary text-black font-display text-lg uppercase tracking-wider clip-corner-tr flex items-center justify-center gap-2 hover:bg-primary/80 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : mode === 'login' ? (
                            <>
                                <LogIn className="w-4 h-4" /> Jack In
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" /> Register
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-mono-tech uppercase">or</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Google */}
                <button
                    onClick={handleGoogle}
                    className="w-full h-10 border border-border bg-surface-dark text-white font-body text-sm clip-corner-tr flex items-center justify-center gap-2 hover:border-secondary hover:text-secondary transition-colors"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                {/* Toggle mode */}
                <p className="text-center text-xs text-muted-foreground font-body">
                    {mode === 'login' ? (
                        <>
                            No account?{' '}
                            <button onClick={() => { setMode('signup'); setError(null); }} className="text-secondary hover:underline">
                                Register
                            </button>
                        </>
                    ) : (
                        <>
                            Already registered?{' '}
                            <button onClick={() => { setMode('login'); setError(null); }} className="text-secondary hover:underline">
                                Jack In
                            </button>
                        </>
                    )}
                </p>
            </DialogContent>
        </Dialog>
    );
}
