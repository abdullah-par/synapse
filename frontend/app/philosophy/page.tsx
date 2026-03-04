"use client";

import { Navbar } from "@/components/navbar";
import { motion } from "framer-motion";

/* ─── Animations & Decor ─────────────────────────────────────────────────── */
const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    show: (delay = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay },
    }),
};

function SketchUnderline({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 200 20"
            preserveAspectRatio="none"
            className={`absolute left-0 -bottom-2 w-full h-3 text-[var(--accent)] opacity-60 pointer-events-none ${className}`}
        >
            <motion.path
                d="M5,15 Q30,5 60,12 T110,15 T160,10 T195,14"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.5 }}
            />
        </svg>
    );
}

function SketchLoop({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 100" className={`absolute text-[var(--border)] opacity-20 pointer-events-none ${className}`}>
            <motion.path
                d="M20,50 C20,20 50,20 50,50 C50,80 80,80 80,50 C80,20 50,20 50,50"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                initial={{ pathLength: 0, scale: 0.8 }}
                animate={{
                    pathLength: [0, 1, 1, 0],
                    rotate: [0, 5, -5, 0],
                    scale: [0.8, 1, 0.9, 0.8]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
        </svg>
    );
}

export default function PhilosophyPage() {
    return (
        <main className="min-h-screen bg-[var(--bg)] selection:bg-[var(--accent-soft)] selection:text-[var(--text-primary)] overflow-hidden relative">
            {/* Background Texture & Decor */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] hero-noise mix-blend-overlay" />
            <SketchLoop className="w-[500px] h-[500px] -top-20 -right-20 rotate-12" />
            <SketchLoop className="w-[600px] h-[600px] -bottom-40 -left-60 -rotate-6" />

            <div className="relative z-10">
                <Navbar />

                <section className="page-shell pt-16 pb-20 sm:pt-24 sm:pb-36 md:pt-40 max-w-[800px] mx-auto">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={0}
                        className="mb-8"
                    >
                        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--text-faint)] border border-[var(--border)] px-3 py-1.5 inline-block rounded-sm">
                            Manifesto v1.0
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={0.1}
                        className="text-[clamp(36px,5vw,72px)] font-light leading-[1.05] tracking-[-0.03em] text-[var(--text-primary)] mb-10 sm:mb-16 font-[var(--font-sans)]"
                    >
                        A tool for <br />
                        <span className="italic font-[var(--font-serif)] relative inline-block">
                            intentional learning.
                            <SketchUnderline />
                        </span>
                    </motion.h1>

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={0.2}
                        className="space-y-16"
                    >
                        <div className="space-y-4">
                            <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-faint)]">
                                The Problem
                            </h2>
                            <p className="text-[16px] font-normal leading-[1.8] text-[var(--text-muted)]">
                                We live in an age of information abundance and wisdom scarcity. YouTube is the world&apos;s largest library, yet most of its knowledge remains locked in linear, unsearchable video streams. We &quot;watch&quot; but we don&apos;t always &quot;know.&quot;
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-faint)]">
                                The Vision
                            </h2>
                            <p className="text-[16px] font-normal leading-[1.8] text-[var(--text-muted)]">
                                Synapse is the bridge. It is not just about transcription; it is about distillation. Our goal is to transform passive consumption into active knowledge building. By externalizing the core concepts of a video into structured, typographic notes, we free your brain to do what it does best: connect ideas.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-faint)]">
                                The Aesthetic
                            </h2>
                            <p className="text-[16px] font-normal leading-[1.8] text-[var(--text-muted)]">
                                Our &quot;Paper Minimalism&quot; design is a statement. We reject the dopamine-driven, cluttered interfaces of modern web apps. We believe a tool for the mind should look like a blank page—ready for your focus.
                            </p>
                        </div>
                    </motion.div>
                </section>
            </div>
        </main>
    );
}
