"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { LucideIcon } from "lucide-react";

interface FeatureSectionProps {
    title: string;
    description: string;
    icon: LucideIcon;
    index: number;
}

export const FeatureSection = ({ title, description, icon: Icon, index }: FeatureSectionProps) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["0 1", "1.33 1"],
    });

    const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
    const opacityProgress = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

    return (
        <motion.div 
            ref={ref}
            style={{
                scale: scaleProgress,
                opacity: opacityProgress,
            }}
            className="min-h-[60vh] flex flex-col justify-center items-center py-20 sticky top-0"
        >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl max-w-4xl mx-auto text-center relative overflow-hidden group hover:border-blue-500/50 transition-colors duration-500">
                
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                
                <div className="relative z-20">
                    <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                        <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white">
                        {title}
                    </h2>
                    
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
