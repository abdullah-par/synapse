"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-8 h-8" />;

    const isDark = resolvedTheme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--bg-subtle)] hover:border-[var(--text-primary)] transition-all duration-300 shadow-sm overflow-hidden"
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={isDark ? "dark" : "light"}
                    initial={{ y: -20, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.25, ease: "circOut" }}
                    className="flex items-center justify-center"
                >
                    {!isDark ? (
                        <Moon size={18} strokeWidth={2.5} className="text-[var(--text-primary)]" />
                    ) : (
                        <Sun size={18} strokeWidth={2.5} className="text-[var(--text-primary)]" />
                    )}
                </motion.div>
            </AnimatePresence>
        </button>
    );
}
