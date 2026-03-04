"use client";

import { motion } from "framer-motion";

export function BrainSVG() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ rotate: 2 }}
            whileTap={{ rotate: 2 }}
            className="relative flex items-center justify-center"
        >
            <motion.svg
                width="400"
                height="300"
                viewBox="0 0 400 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="brain-svg w-full h-auto"
                style={{ color: "var(--text-primary)" }}
                animate={{
                    scale: [1, 1.015, 1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <g style={{ color: "var(--text-primary)" }}>
                    {/* Main Brain Outer Silhouette */}
                    <path
                        d="M200 60C140 60 90 100 85 160C80 220 110 260 160 270C160 270 170 280 190 280C210 280 220 270 240 270C290 260 320 220 315 160C310 100 260 60 200 60Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />

                    {/* Detailed Anatomical Gyri (Folders) - Frontal Lobe */}
                    <path
                        d="M130 90C120 100 115 120 120 140"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M160 80C155 100 150 125 155 145"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                    />
                    <path
                        d="M100 150C105 160 120 165 140 160"
                        stroke="currentColor"
                        strokeWidth="1"
                    />

                    {/* Central Sulcus Area */}
                    <path
                        d="M200 65V150"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />

                    {/* Parietal Lobe Gyri */}
                    <path
                        d="M240 85C250 95 255 115 250 135"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M275 110C280 125 285 145 280 165"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                    />

                    {/* Temporal Lobe Gyri (Bottom) */}
                    <path
                        d="M150 200C160 210 190 215 220 210"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M165 230C180 240 210 245 235 235"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                    />
                    <path
                        d="M120 180C130 195 150 200 180 190"
                        stroke="currentColor"
                        strokeWidth="1"
                    />

                    {/* Occipital Lobe (Back) */}
                    <path
                        d="M290 180C300 190 305 210 300 230"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                    />

                    {/* Internal Complex Pathways (Blueprint style) */}
                    <path
                        d="M180 140C190 150 210 150 220 140"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        strokeDasharray="4 4"
                    />
                    <path
                        d="M170 160C185 175 215 175 230 160"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                    />

                    {/* Cerebellum (Bottom Rear) */}
                    <path
                        d="M240 240C250 250 270 255 285 245C295 240 300 230 295 215"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                    />
                    <path
                        d="M250 250L280 250"
                        stroke="currentColor"
                        strokeWidth="0.5"
                    />

                    {/* Brain Stem Component */}
                    <path
                        d="M190 270C195 285 205 285 210 270"
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                </g>
            </motion.svg>
        </motion.div>
    );
}
