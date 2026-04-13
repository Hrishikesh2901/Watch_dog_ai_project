"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { NavBar } from "@/components/NavBar";
import CountUp from "@/components/CountUp";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Report {
    id: number;
    category: string;
    location: string;
    description: string;
    timestamp: string;
    status: string;
    rejection_reason?: string;
    resolution_steps?: string;
    sector?: string;
}

interface AnalyticsData {
    sector_counts: Record<string, number>;
    category_counts: Record<string, number>;
    status_counts: Record<string, number>;
}

interface UserStatus {
    id: number;
    full_name: string;
    email: string;
    mobile_number: string;
    application_status: string;
    rejection_reason?: string;
    timestamp: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

export default function AdminDashboard() {
    const { token, user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [users, setUsers] = useState<UserStatus[]>([]);
    const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'reports'>('analytics');

    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [lastIngestionStatus, setLastIngestionStatus] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('All');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 50;

    // Reject Form
    const [rejectReason, setRejectReason] = useState("");
    const [rejectResolution, setRejectResolution] = useState("");
    // Ingestion Progress
    const [ingestionProgress, setIngestionProgress] = useState<{ status: string; current: number; total: number; message: string } | null>(null);

    // Polling for ingestion status
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isUploading || (ingestionProgress && ingestionProgress.status === 'processing')) {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get('http://127.0.0.1:8000/api/admin/ingest/status', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setIngestionProgress(res.data);

                    if (res.data.status === 'completed' || res.data.status === 'error') {
                        setIsUploading(false);
                        setLastIngestionStatus(res.data.message);
                        if (res.data.status === 'completed') fetchData();
                        setTimeout(() => setIngestionProgress(null), 5000); // Clear progress bar after 5s
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isUploading, ingestionProgress?.status, token]);
    useEffect(() => {
        if (token && user?.role === 'admin') {
            fetchData();
        }
    }, [token, user, page, statusFilter]);

    const fetchData = async () => {
        try {
            // Fetch reports and analytics only once or when needed? For simple dashboard, fetch all.
            // But users need pagination.
            const [reportsRes, analyticsRes, usersRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/admin/reports', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://127.0.0.1:8000/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`http://127.0.0.1:8000/api/admin/users?page=${page}&limit=${LIMIT}&status=${statusFilter}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setReports(reportsRes.data);
            setAnalytics(analyticsRes.data);
            setUsers(usersRes.data.users || []); // Handle new structure
            setTotalPages(Math.ceil((usersRes.data.total || 0) / LIMIT));
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (!file.name.endsWith('.csv')) {
            alert("Please upload a CSV file.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        setLastIngestionStatus(null);
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/admin/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            const msg = res.data.message || "Ingestion started in background.";
            setLastIngestionStatus(msg);
            // Polling useEffect will take over
        } catch (error: any) {
            console.error("Ingestion failed", error);
            const errorMsg = error.response?.data?.detail || "Failed to start ingestion.";
            setLastIngestionStatus(`Error: ${errorMsg}`);
            alert(errorMsg);
            setIsUploading(false);
        } finally {
            // Do not set isUploading(false) here if successful; let polling handle it
            // Only reset input
            e.target.value = '';
        }
    };

    const handleApprove = async (report: Report) => {
        if (!confirm("Confirm approval?")) return;
        updateStatus(report.id, "Approved");
    };

    const handleRejectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReport) return;
        updateStatus(selectedReport.id, "Rejected", rejectReason, rejectResolution);
        setShowRejectModal(false);
        setRejectReason("");
        setRejectResolution("");
        setSelectedReport(null);
    };

    const handleReset = async () => {
        if (!confirm("WARNING: This will delete ALL reports and users (except admins). This action cannot be undone. Are you sure?")) return;
        try {
            await axios.post('http://127.0.0.1:8000/api/admin/clear-data', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("All data cleared successfully.");
            fetchData();
        } catch (error) {
            console.error("Reset failed", error);
            alert("Failed to clear data.");
        }
    };

    const handleCleanData = async () => {
        try {
            setIsUploading(true); // Reusing uploading state for spinner/feedback
            const res = await axios.post('http://127.0.0.1:8000/api/admin/clean-data', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                alert(res.data.message);
                fetchData();
            } else {
                alert("Data cleaning failed: " + res.data.message);
            }
        } catch (error) {
            console.error("Data cleaning error", error);
            alert("An error occurred during data cleaning.");
        } finally {
            setIsUploading(false);
        }
    };

    const updateStatus = async (id: number, status: string, reason?: string, resolution?: string) => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/admin/reports/${id}/status`, {
                status,
                rejection_reason: reason,
                resolution_steps: resolution
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData(); // Refresh ALL data
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update status");
        }
    };

    if (!user || user.role !== 'admin') {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied. Admins only.</div>;
    }

    const prepareChartData = (data: Record<string, number> | undefined) => {
        if (!data) return [];
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <NavBar />
            <div className="container mx-auto px-4 pt-24 pb-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploading}
                            />
                            <button
                                className={`px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors flex items-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                {isUploading ? 'Ingesting...' : 'Ingest Dataset'}
                            </button>
                        </div>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Reset Data
                        </button>
                        <button
                            onClick={handleCleanData}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium transition-colors flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            Data Cleaning
                        </button>
                        <div className="flex space-x-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                            {(['analytics', 'users', 'reports'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab
                                        ? 'bg-blue-500 text-white'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>


                {ingestionProgress && ingestionProgress.status === 'processing' && (
                    <div className="mb-6 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-blue-200 dark:border-blue-900 animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-blue-700 dark:text-blue-400">Ingesting Dataset...</span>
                            <span className="text-sm text-slate-500">{ingestionProgress.current} / {ingestionProgress.total}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out relative"
                                style={{ width: `${(ingestionProgress.current / (ingestionProgress.total || 1)) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 italic">{ingestionProgress.message}</p>
                    </div>
                )}

                {lastIngestionStatus && (
                    <div className={`mb-6 p-4 rounded-xl border ${lastIngestionStatus.startsWith('Error') ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400' : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/10 dark:border-green-800 dark:text-green-400'} animate-in fade-in slide-in-from-top-2`}>
                        <div className="flex items-center">
                            {lastIngestionStatus.startsWith('Error') ? (
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            <span className="font-medium">{lastIngestionStatus}</span>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-blue-500 to-violet-600 text-white transform hover:scale-105 transition-transform duration-200">
                            <h3 className="text-sm font-medium opacity-80 mb-2 uppercase tracking-wider">Total Applications</h3>
                            <div className="text-4xl font-bold">
                                <CountUp to={Object.values(analytics.status_counts).reduce((a, b) => a + b, 0)} separator="," />
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white transform hover:scale-105 transition-transform duration-200">
                            <h3 className="text-sm font-medium opacity-80 mb-2 uppercase tracking-wider">Approved</h3>
                            <div className="text-4xl font-bold">
                                <CountUp to={analytics.status_counts['Approved'] || 0} separator="," />
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-red-500 to-pink-600 text-white transform hover:scale-105 transition-transform duration-200">
                            <h3 className="text-sm font-medium opacity-80 mb-2 uppercase tracking-wider">Rejected</h3>
                            <div className="text-4xl font-bold">
                                <CountUp to={analytics.status_counts['Rejected'] || 0} separator="," />
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white transform hover:scale-105 transition-transform duration-200">
                            <h3 className="text-sm font-medium opacity-80 mb-2 uppercase tracking-wider">Processing</h3>
                            <div className="text-4xl font-bold">
                                <CountUp to={analytics.status_counts['Processing'] || 0} separator="," />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && analytics && (
                    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Reports by Sector</h3>
                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={prepareChartData(analytics.sector_counts)} margin={{ bottom: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#64748b"
                                            fontSize={10}
                                            tickFormatter={(val) => val.slice(0, 15)}
                                            angle={-45}
                                            textAnchor="end"
                                            interval={0}
                                        />
                                        <YAxis stroke="#64748b" fontSize={12} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Reports by Category</h3>
                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={prepareChartData(analytics.category_counts)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {prepareChartData(analytics.category_counts).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        {/* Removing Legend for clarity as there are too many categories. Tooltips are sufficient. */}
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 md:col-span-2">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Application Status Distribution</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={prepareChartData(analytics.status_counts)} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis type="number" stroke="#64748b" />
                                        <YAxis dataKey="name" type="category" stroke="#64748b" width={100} />
                                        <RechartsTooltip />
                                        <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={30}>
                                            {prepareChartData(analytics.status_counts).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={
                                                    entry.name === 'Approved' ? '#10B981' :
                                                        entry.name === 'Rejected' ? '#EF4444' : '#F59E0B'
                                                } />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex justify-end">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1); // Reset to page 1 on filter change
                                }}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="All">All Status</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold tracking-wider sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 border-b dark:border-slate-700">User Details</th>
                                        <th className="p-4 border-b dark:border-slate-700">Application Status</th>
                                        <th className="p-4 border-b dark:border-slate-700">Last Activity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {users.map((u, i) => (
                                        <tr key={u.id} className={`transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/10 ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                                            <td className="p-4">
                                                <div className="font-medium text-slate-900 dark:text-white">{u.full_name || "Unknown"}</div>
                                                <div className="text-xs text-slate-500">{u.mobile_number}</div>
                                                <div className="text-xs text-slate-500">{u.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center ${u.application_status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    u.application_status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {u.application_status || "No Application"}
                                                </span>
                                                {u.application_status === 'Rejected' && u.rejection_reason && (
                                                    <div className="text-xs text-red-500 mt-1 max-w-xs truncate" title={u.rejection_reason}>
                                                        Reason: {u.rejection_reason}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-xs text-slate-500">
                                                {u.timestamp ? new Date(u.timestamp).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && <div className="p-8 text-center text-slate-500">No users found.</div>}

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="px-3 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold tracking-wider sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 border-b dark:border-slate-700">ID</th>
                                    <th className="p-4 border-b dark:border-slate-700">Date</th>
                                    <th className="p-4 border-b dark:border-slate-700">Category</th>
                                    <th className="p-4 border-b dark:border-slate-700 w-1/3">Description</th>
                                    <th className="p-4 border-b dark:border-slate-700">Location</th>
                                    <th className="p-4 border-b dark:border-slate-700">Status</th>
                                    <th className="p-4 border-b dark:border-slate-700">Rejection Reason</th>
                                    <th className="p-4 border-b dark:border-slate-700">Resolution Steps</th>
                                    <th className="p-4 border-b dark:border-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {reports.map((report, i) => (
                                    <tr key={report.id} className={`transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/10 ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                                        <td className="p-4 text-slate-500 text-sm">#{report.id}</td>
                                        <td className="p-4 text-slate-900 dark:text-white text-sm">{new Date(report.timestamp).toLocaleDateString()}</td>
                                        <td className="p-4 text-slate-900 dark:text-white text-sm font-medium">
                                            {report.category}
                                            {report.sector && <div className="text-xs text-slate-400 font-normal">{report.sector}</div>}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400 text-sm truncate max-w-xs">{report.description}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">{report.location}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${report.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                report.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400 text-sm max-w-xs truncate" title={report.rejection_reason}>
                                            {report.rejection_reason || '-'}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400 text-sm max-w-xs truncate" title={report.resolution_steps}>
                                            {report.resolution_steps || '-'}
                                        </td>
                                        <td className="p-4">
                                            {report.status === 'Pending' && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(report)}
                                                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedReport(report);
                                                            setShowRejectModal(true);
                                                        }}
                                                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl">
                            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Reject Request #{selectedReport?.id}</h3>
                            <form onSubmit={handleRejectSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Rejection Reason</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        rows={3}
                                        value={rejectReason}
                                        onChange={e => setRejectReason(e.target.value)}
                                        required
                                        placeholder="Why is it being rejected?"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Resolution Steps</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        rows={3}
                                        value={rejectResolution}
                                        onChange={e => setRejectResolution(e.target.value)}
                                        required
                                        placeholder="What should the user do next?"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectModal(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Confirm Rejection
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
