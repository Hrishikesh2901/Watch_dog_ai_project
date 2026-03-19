"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { api, ReportResponse } from "@/lib/api";

export function ReportForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      category: formData.get("category") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
    };

    try {
      const result = await api.submitReport(data);
      setSuccess(`Report Submitted! Tags: ${result.tags.join(", ")}`);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 rounded-xl shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Report an Issue</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="category"
            required
            defaultValue=""
            className="p-3 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="" disabled>Select Category</option>
            <option value="Housing">Housing</option>
            <option value="Ration">Ration</option>
            <option value="Visa/Passport">Visa/Passport</option>
            <option value="Employment/Jobs">Employment/Jobs</option>
            <option value="Other">Other</option>
          </select>
          <select
            name="location"
            required
            defaultValue=""
            className="p-3 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="" disabled>Select Location</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <textarea
          name="description"
          placeholder="Describe your issue..."
          required
          rows={4}
          className="w-full p-3 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-600 font-bold text-white hover:opacity-90 transition disabled:opacity-50 shadow-md"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "Submit Report"}
        </button>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/50 text-green-800 dark:text-green-200 rounded-lg text-center"
          >
            {success}
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
