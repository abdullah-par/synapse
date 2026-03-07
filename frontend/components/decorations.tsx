"use client";

import { motion } from "framer-motion";

const CRAYON_COLORS = {
    blue: "#4da6ff",
    pink: "#ff85c0",
    orange: "#ffa940",
    green: "#73d13d",
    purple: "#b37feb",
    red: "#ff7875"
};

type CrayonColor = keyof typeof CRAYON_COLORS;

export function SketchUnderline({ className = "", color = "green" }: { className?: string; color?: CrayonColor }) {
    return (
        <svg
            viewBox="0 0 200 20"
            preserveAspectRatio="none"
            className={`absolute left-0 -bottom-2 w-full h-4 opacity-70 pointer-events-none ${className}`}
            style={{ color: CRAYON_COLORS[color] }}
        >
            <motion.path
                d="M5,15 C35,8 70,14 105,15 C140,16 170,10 195,14"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="1, 2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
            />
        </svg>
    );
}

export function SketchArrow({ className = "", color = "blue" }: { className?: string; color?: CrayonColor }) {
    return (
        <svg
            viewBox="0 0 100 60"
            fill="none"
            stroke="currentColor"
            className={`w-24 h-16 opacity-60 pointer-events-none ${className}`}
            style={{ color: CRAYON_COLORS[color] }}
        >
            <motion.path
                d="M10,12 C40,5 60,20 70,50 M60,40 L70,50 L82,42"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="2, 3"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
            />
        </svg>
    );
}

export function SketchLoop({ className = "", color = "pink" }: { className?: string; color?: CrayonColor }) {
    return (
        <svg viewBox="0 0 100 100" className={`absolute opacity-40 pointer-events-none ${className}`} style={{ color: CRAYON_COLORS[color] }}>
            <motion.path
                d="M22,52 C22,22 48,22 52,50 C54,78 78,78 82,52 C84,24 54,22 52,50"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="1, 4"
                initial={{ pathLength: 0, scale: 0.8 }}
                animate={{
                    pathLength: [0, 1, 1, 0],
                    rotate: [0, 8, -8, 0],
                    scale: [0.85, 1, 0.95, 0.85]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </svg>
    );
}

export function SketchHighlight({ className = "", color = "orange" }: { className?: string; color?: CrayonColor }) {
    return (
        <svg
            viewBox="0 0 100 40"
            fill="none"
            stroke="currentColor"
            className={`absolute inset-0 w-full h-full opacity-40 pointer-events-none -mx-2 -my-1 ${className}`}
            style={{ color: CRAYON_COLORS[color] }}
        >
            <motion.path
                d="M8,18 C12,6 92,8 94,22 C96,36 12,38 8,24"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="1, 3"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />
        </svg>
    );
}

export function SketchBox({ className = "", color = "purple" }: { className?: string; color?: CrayonColor }) {
    return (
        <svg viewBox="0 0 100 100" className={`absolute opacity-30 pointer-events-none ${className}`} style={{ color: CRAYON_COLORS[color] }}>
            <motion.rect
                x="12" y="12" width="76" height="76"
                rx="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="2, 5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 1, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
        </svg>
    );
}

