'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2 } from 'lucide-react';
import posthog from 'posthog-js';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // PostHog: Track admin login attempted
        posthog.capture('admin_login_attempted', {
            email: email,
        });

        // Mock authentication
        setTimeout(() => {
            setIsLoading(false);
            if (email === 'admin@awuraba.co' && password === 'admin123') {
                // PostHog: Identify admin user on successful login
                posthog.identify(email, {
                    email: email,
                    role: 'admin',
                });
                posthog.capture('admin_login_success', {
                    email: email,
                });
                router.push('/admin');
            } else {
                posthog.capture('admin_login_failed', {
                    email: email,
                    reason: 'invalid_credentials',
                });
                alert('Invalid credentials. Use admin@awuraba.co / admin123');
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="text-center">
                    <h1 className="font-serif text-4xl font-bold tracking-tight text-black dark:text-white uppercase">
                        AWURABA
                    </h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400 font-light tracking-wide">
                        Admin Dashboard Access
                    </p>
                </div>

                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1 block">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                                    placeholder="admin@awuraba.co"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1 block">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black dark:bg-white text-white dark:text-black rounded-lg py-4 text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <p className="text-center text-xs text-neutral-500 dark:text-neutral-600">
                        &copy; {new Date().getFullYear()} AWURABA Collective. All rights reserved.
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
