"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';

interface Report {
    id: number;
    category: string;
    location: string;
    description: string;
    timestamp: string;
    status: string;
    rejection_reason?: string;
    resolution_steps?: string;
}

export default function UserDashboard() {
    const { user, token, loading } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [activeReport, setActiveReport] = useState<Report | null>(null);
    const [activeTab, setActiveTab] = useState<'reports' | 'profile'>('reports');

    useEffect(() => {
        if (token) {
            fetchReports();
        }
    }, [token]);

    const fetchReports = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/my-reports', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(res.data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Please login to view dashboard.</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 pt-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Reports</h1>
                    <div className="space-x-4">
                        <Link href="/" className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700 transition">
                            Back Home
                        </Link>
                        {/* Placeholder for New Report Action - potentially link to separate page or modal */}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-8 border-b border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${
                            activeTab === 'reports'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        My Reports
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${
                            activeTab === 'profile'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        Personal Details
                    </button>
                </div>

                {activeTab === 'reports' ? (
                    <div className="space-y-8 animate-in fade-in">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Total Reports</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{reports.length}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Approved</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{reports.filter(r => r.status === 'Approved').length}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Pending</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{reports.filter(r => r.status === 'Pending').length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in">
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div 
                                key={report.id}
                                onClick={() => setActiveReport(report)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    activeReport?.id === report.id 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 shadow-md' 
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-slate-900 dark:text-white">{report.category}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        report.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                        report.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {report.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{report.description}</p>
                                <p className="text-xs text-slate-400 mt-2">{new Date(report.timestamp).toLocaleDateString()}</p>
                            </div>
                        ))}
                        {reports.length === 0 && (
                            <div className="text-center p-8 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                No reports submitted yet.
                            </div>
                        )}
                    </div>

                    <div className="md:h-[600px] sticky top-6">
                        {activeReport ? (
                            <div className="h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full pointer-events-none" />
                                
                                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white border-b pb-4 dark:border-slate-800">
                                    Report Details
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Category</label>
                                        <p className="text-lg text-slate-900 dark:text-white">{activeReport.category}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Location</label>
                                        <p className="text-slate-900 dark:text-white">{activeReport.location}</p>
                                    </div>

                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Description</label>
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg mt-1">
                                            {activeReport.description}
                                        </p>
                                    </div>

                                    {activeReport.status === 'Rejected' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                                                <h3 className="flex items-center text-red-700 dark:text-red-400 font-semibold mb-2">
                                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    Rejection Reason
                                                </h3>
                                                <p className="text-red-800 dark:text-red-300 text-sm">
                                                    {activeReport.rejection_reason || "No specific reason provided."}
                                                </p>
                                            </div>

                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl">
                                                <h3 className="flex items-center text-blue-700 dark:text-blue-400 font-semibold mb-2">
                                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    How to Resolve
                                                </h3>
                                                <p className="text-blue-800 dark:text-blue-300 text-sm">
                                                    {activeReport.resolution_steps || "Please contact support for further assistance."}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <span className="text-4xl mb-4">👈</span>
                                <p>Select a report to view details</p>
                            </div>
                        )}
                    </div>
                </div>
                </div>
                ) : (
                    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 animate-in fade-in">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {user.full_name?.charAt(0) || user.username.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.full_name}</h2>
                                <p className="text-slate-500">Citizen ID: {user.username}</p>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Full Name</label>
                                <p className="font-medium text-slate-900 dark:text-white">{user.full_name}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Date of Birth</label>
                                <p className="font-medium text-slate-900 dark:text-white">{user.date_of_birth}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Age / Sex</label>
                                <p className="font-medium text-slate-900 dark:text-white">{user.age} / {user.sex}</p>
                            </div>
                             <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Contact</label>
                                <p className="font-medium text-slate-900 dark:text-white">{user.mobile_number}</p>
                                <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Aadhaar Number (Masked)</label>
                                <p className="font-mono bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg text-slate-900 dark:text-white">
                                    XXXX-XXXX-{user.aadhaar_number?.slice(-4)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
