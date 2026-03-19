"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LiquidEther from '@/components/LiquidEther';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, register } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(username, password);
            } else {
                const success = await register(username, password);
                if (success) {
                    await login(username, password);
                } else {
                    setError('Registration failed. Username may be taken.');
                }
            }
        } catch (err) {
            setError('Authentication failed. Check credentials.');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-gray-50 dark:bg-slate-950 overflow-hidden">
             <div className="absolute inset-0 z-0">
                  <LiquidEther 
                    colors={['#5227FF', '#FF9FFC', '#B19EEF']} 
                    mouseForce={20}
                    cursorSize={100}
                    isViscous={false}
                    dt={0.014}
                  />
             </div>
             <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 relative z-10 mx-4">
                <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 block">
                    ← Back to Home
                </Link>
                <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
                    {isLogin ? 'Welcome Back' : 'Join the Watchdog'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    {isLogin ? 'Login to view your reports' : 'Create an account to submit reports'}
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 hover:underline font-medium"
                    >
                        {isLogin ? 'Sign up' : 'Login'}
                    </button>
                </div>
            </div>
        </div>

    );
}
