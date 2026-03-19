"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import GooeyNav from './GooeyNav';

export const NavBar = () => {
    const { user, logout } = useAuth();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="font-bold text-xl text-slate-900 dark:text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                    AI Watchdog
                </div>
                
                <div className="hidden md:block">
                     <div className="bg-slate-900 rounded-full px-4 py-1.5 shadow-lg shadow-blue-500/5 overflow-hidden relative">
                        <GooeyNav 
                            items={[
                                { label: "Home", href: "#", onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                                { label: "Objectives", href: "#objectives", onClick: () => scrollToSection('objectives') },
                                { label: "Features", href: "#features", onClick: () => scrollToSection('features') },
                                { label: "How it Works", href: "#flow", onClick: () => scrollToSection('flow') },
                            ]}
                            particleCount={15}
                            particleDistances={[90, 10]}
                            particleR={100}
                            initialActiveIndex={0}
                            animationTime={600}
                            timeVariance={300}
                            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
                        />
                     </div>
                </div>

                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-slate-500 hidden sm:block">Hi, {user.full_name || user.username}</span>
                            <Link href={user.role === 'admin' ? "/admin" : "/dashboard/user"} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition">
                                Dashboard
                            </Link>
                            <button onClick={logout} className="text-sm text-slate-500 hover:text-red-500">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="px-6 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 rounded-full transition">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};
