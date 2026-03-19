"use client";
import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ObjectiveCardProps {
    title: string;
    why: string;
    example: string;
    gradient: string;
}

export const ObjectiveCard = ({ title, why, example, gradient }: ObjectiveCardProps) => {
    return (
        <div className="group h-96 w-full [perspective:1000px]">
            <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* Front Faces */}
                <div className="absolute h-full w-full [backface-visibility:hidden] rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 shadow-xl border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                     <div className={`h-20 w-20 rounded-full mb-6 ${gradient} opacity-20 animate-pulse`} />
                     <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 mb-4">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mt-4">Hover to Reveal</p>
                </div>

                {/* Back Face */}
                <div className="absolute h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl bg-slate-900 text-white p-8 shadow-xl border border-slate-700 flex flex-col justify-center">
                     <div className="flex-grow space-y-4 flex flex-col justify-center">
                        <div className="text-left">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Why</span>
                            <p className="text-base leading-relaxed mt-1 text-slate-300">{why}</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800 text-left">
                         <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Example</span>
                         <p className="text-sm italic text-slate-400 mt-1">{example}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
