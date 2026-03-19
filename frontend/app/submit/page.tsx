"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { NavBar } from "@/components/NavBar";

export default function SubmitReportPage() {
    const { token, user } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        category: 'Housing',
        location: '',
        description: '',
        tags: ''
    });

    const categories = ["Housing", "Visa", "Jobs", "Ration", "Healthcare", "Education", "Other"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/submit-report', {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim())
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            router.push('/dashboard/user');
        } catch (error) {
            console.error("Submission failed", error);
            alert("Failed to submit report. Please try again.");
        }
    };

    if (!user) {
        return <div className="p-8 text-center">Please login to submit a report.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <NavBar />
            <div className="container mx-auto px-4 py-24 max-w-2xl">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                    <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Submit New Application</h1>
                    <p className="mb-8 text-slate-600 dark:text-slate-400">
                        Share your experience. Your data will be anonymized and used to reveal systemic patterns.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Category / Decision Type</label>
                            <select 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Location (State/City)</label>
                            <input 
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Mumbai, Maharashtra"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Description / Story</label>
                            <textarea 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                                placeholder="Describe what happened, the decision you received, and any specific reasons given..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Tags (comma separated)</label>
                            <input 
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. biometric failure, no reason, delay"
                            />
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                        >
                            Submit Application
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
