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

import { SketchUnderline, SketchLoop, SketchBox } from "@/components/decorations";

export default function PhilosophyPage() {
    return (
        <main className="min-h-screen bg-[var(--bg)] selection:bg-[var(--accent-soft)] selection:text-[var(--text-primary)] overflow-hidden relative">
            {/* Background Texture & Decor */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] hero-noise mix-blend-overlay" />
            <SketchLoop className="w-[400px] h-[400px] top-20 -right-20 rotate-12" color="blue" />
            <SketchLoop className="w-[500px] h-[500px] bottom-40 -left-60 -rotate-6" color="pink" />
            <SketchBox className="w-[150px] h-[150px] top-[40%] left-[2%] rotate-12" color="orange" />
            <SketchBox className="w-[200px] h-[200px] bottom-[20%] right-[5%] -rotate-12" color="purple" />

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
                        className="text-[clamp(40px,6vw,80px)] font-bold leading-[1] tracking-[-0.04em] text-[var(--text-primary)] mb-12 sm:mb-20"
                    >
                        A tool for <br />
                        <span className="italic font-light relative inline-block" style={{ fontFamily: "var(--font-serif)" }}>
                            intentional learning.
                            <SketchUnderline color="green" />
                        </span>
                    </motion.h1>

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={0.2}
                        className="space-y-16"
                    >
                        <div className="space-y-6">
                            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
                                The Problem
                            </h2>
                            <p className="text-[17px] font-normal leading-[1.8] text-[var(--text-muted)] max-w-[640px]">
                                We live in an age of information abundance and wisdom scarcity. YouTube is the world&apos;s largest library, yet most of its knowledge remains locked in linear, unsearchable video streams. We &quot;watch&quot; but we don&apos;t always &quot;know.&quot;
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
                                The Vision
                            </h2>
                            <p className="text-[17px] font-normal leading-[1.8] text-[var(--text-muted)] max-w-[640px]">
                                Synapse is the bridge. It is not just about transcription; it is about distillation. Our goal is to transform passive consumption into active knowledge building. By externalizing the core concepts of a video into structured, typographic notes, we free your brain to do what it does best: connect ideas.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
                                The Aesthetic
                            </h2>
                            <p className="text-[17px] font-normal leading-[1.8] text-[var(--text-muted)] max-w-[640px]">
                                Our &quot;Paper Minimalism&quot; design is a statement. We reject the dopamine-driven, cluttered interfaces of modern web apps. We believe a tool for the mind should look like a blank page—ready for your focus.
                            </p>
                        </div>
                    </motion.div>
                </section>
            </div>
        </main>
    );
}
