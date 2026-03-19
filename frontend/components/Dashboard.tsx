"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { api, Report } from "@/lib/api";
import { useTheme } from "next-themes";

export function Dashboard() {
  const [data, setData] = useState<Report[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    api.getReports().then(setData).catch(console.error);
  }, []);

  const categoryData = Object.entries(
    data.reduce((acc: any, curr: Report) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF"];
  const isDark = theme === 'dark';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto mt-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        className="p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm backdrop-blur-md"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Reports by Category</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <XAxis dataKey="name" stroke={isDark ? "#888" : "#4b5563"} />
              <YAxis stroke={isDark ? "#888" : "#4b5563"} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: isDark ? "#333" : "#fff", 
                  borderColor: isDark ? "#444" : "#e5e7eb",
                  color: isDark ? "#fff" : "#000"
                }}
                itemStyle={{ color: isDark ? "#fff" : "#000" }}
              />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        className="p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm backdrop-blur-md"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Distribution</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? "#333" : "#fff", 
                  borderColor: isDark ? "#444" : "#e5e7eb",
                  color: isDark ? "#fff" : "#000"
                }}
                itemStyle={{ color: isDark ? "#fff" : "#000" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
