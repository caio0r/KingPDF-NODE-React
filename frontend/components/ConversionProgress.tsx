"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConversionProgressProps {
    isConverting: boolean;
    color?: string; // e.g., 'bg-blue-600'
}

export default function ConversionProgress({ isConverting, color = 'bg-blue-600' }: ConversionProgressProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isConverting) {
            setProgress(0);
            // Simulate progress: Fast to 30%, steady to 70%, slow to 95%
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) return 95;

                    let increment = 1;
                    if (prev < 30) increment = 2; // Fast start
                    else if (prev < 70) increment = 0.5; // Steady middle
                    else increment = 0.1; // Slow end crawl

                    // Add a little randomness
                    if (Math.random() > 0.5) increment *= 1.5;

                    return Math.min(95, prev + increment);
                });
            }, 100);
        } else {
            // When converting stops (success or error), jump to 100 momentarily
            // Ideally the parent unmounts this, but if not, 100 is good.
            setProgress(100);
        }

        return () => clearInterval(interval);
    }, [isConverting]);

    if (!isConverting && progress === 0) return null;

    return (
        <div className="w-full max-w-md mx-auto mt-6">
            <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                <span>Processando arquivo...</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <motion.div
                    className={`h-full ${color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                />
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2 animate-pulse">
                Não feche a página, estamos trabalhando no seu arquivo.
            </p>
        </div>
    );
}
