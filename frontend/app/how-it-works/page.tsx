"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  ArrowRight,
  Youtube,
  Brain,
  Layers,
  FileText,
  Clock,
  Sparkles,
  Code2,
  CheckCircle2,
  Zap,
  ChevronRight,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

/* ─── Animation Variants ─────────────────────────────────────────────────── */
const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay },
  }),
};

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Sketchy Decorations ────────────────────────────────────────────────── */
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
    <svg
      viewBox="0 0 100 100"
      className={`absolute text-[var(--border)] opacity-20 pointer-events-none ${className}`}
    >
      <motion.path
        d="M20,50 C20,20 50,20 50,50 C50,80 80,80 80,50 C80,20 50,20 50,50"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0, scale: 0.8 }}
        animate={{
          pathLength: [0, 1, 1, 0],
          rotate: [0, 5, -5, 0],
          scale: [0.8, 1, 0.9, 0.8],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </svg>
  );
}

/* ─── Timeline connector line ─────────────────────────────────────────────── */
function TimelineConnector() {
  return (
    <motion.div
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="hidden md:block absolute left-1/2 -translate-x-1/2 w-[2px] h-full bg-gradient-to-b from-[var(--accent)] via-[var(--border)] to-transparent origin-top"
    />
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function HowItWorksPage() {
  const steps = [
    {
      step: "01",
      icon: <Youtube size={28} />,
      title: "Paste any YouTube URL",
      desc: "Drop any public YouTube link into Synapse. We instantly validate the URL and begin extracting the full transcript — no browser extensions, no downloads, no account required.",
      details: [
        "Supports any public YouTube video",
        "Handles videos up to 6+ hours long",
        "Automatic language detection",
        "Falls back to subtitle extraction if needed",
      ],
      accent: "var(--mac-red)",
    },
    {
      step: "02",
      icon: <Brain size={28} />,
      title: "AI structures the content",
      desc: "Our AI engine analyzes the full transcript, identifies the narrative arc, and restructures everything into logical sections with timestamps, key takeaways, and formatted code blocks.",
      details: [
        "Powered by Llama 3.3 70B via Groq",
        "Contextual understanding, not just transcription",
        "Auto-detects code snippets & formats them",
        "Generates key takeaways per section",
      ],
      accent: "var(--accent)",
    },
    {
      step: "03",
      icon: <FileText size={28} />,
      title: "Download or copy your notes",
      desc: "Your structured, beautifully formatted notes are ready in seconds. Copy them to your clipboard or download as a Markdown file — ready for Notion, Obsidian, or any knowledge base.",
      details: [
        "One-click copy to clipboard",
        "Download as clean Markdown",
        "Works with Notion, Obsidian, Logseq & more",
        "Timestamped sections link back to the video",
      ],
      accent: "var(--mac-green)",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--bg)] selection:bg-[var(--accent-soft)] selection:text-[var(--text-primary)] overflow-hidden relative">
      {/* Background decor */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] hero-noise mix-blend-overlay" />
      <SketchLoop className="w-[500px] h-[500px] -top-20 -right-20 rotate-12" />
      <SketchLoop className="w-[600px] h-[600px] -bottom-40 -left-60 -rotate-6" />

      <div className="relative z-10">
        <Navbar />

        {/* ── Hero Header ────────────────────────────────────────────────── */}
        <section className="page-shell pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-36 md:pb-20 max-w-[900px] mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="mb-6"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--text-faint)] border border-[var(--border)] px-3 py-1.5 inline-block rounded-sm">
              How It Works
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.1}
            className="text-[clamp(36px,5vw,72px)] font-bold leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)] mb-6"
          >
            From video to{" "}
            <span
              className="italic font-light relative inline-block"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              structured knowledge
              <SketchUnderline />
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.2}
            className="text-[17px] text-[var(--text-muted)] max-w-[560px] mx-auto leading-relaxed mb-10"
          >
            Three simple steps. No accounts, no extensions, no friction. Just
            paste a URL and let Synapse turn hours of video into actionable
            notes in seconds.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.3}
            className="flex items-center justify-center gap-6 flex-wrap text-[13px] text-[var(--text-muted)]"
          >
            {[
              { icon: <Clock size={14} />, text: "< 5 seconds" },
              { icon: <Zap size={14} />, text: "No account needed" },
              { icon: <Sparkles size={14} />, text: "AI-powered" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5">
                <span className="text-[var(--text-primary)]">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── Steps Timeline ─────────────────────────────────────────────── */}
        <Section className="py-16 sm:py-24 md:py-32">
          <div className="page-shell max-w-[1000px] mx-auto">
            <div className="relative">
              {/* Vertical connector line (desktop) */}
              <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0">
                <TimelineConnector />
              </div>

              <div className="space-y-16 md:space-y-28">
                {steps.map((item, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{
                        duration: 0.6,
                        delay: 0.1,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                      className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                        isEven ? "" : "md:flex-row-reverse"
                      }`}
                    >
                      {/* Step number badge (center on desktop) */}
                      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10 w-14 h-14 rounded-full border-[2px] border-[var(--text-primary)] bg-[var(--bg)] shadow-[4px_4px_0_0_var(--text-primary)] items-center justify-center">
                        <span className="font-mono text-[16px] font-bold text-[var(--text-primary)]">
                          {item.step}
                        </span>
                      </div>

                      {/* Content card */}
                      <div
                        className={`flex-1 ${
                          isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"
                        }`}
                      >
                        {/* Mobile step badge */}
                        <div className="flex md:hidden items-center gap-3 mb-4">
                          <div
                            className="w-10 h-10 rounded-full border-[2px] border-[var(--text-primary)] bg-[var(--bg)] shadow-[3px_3px_0_0_var(--text-primary)] flex items-center justify-center"
                          >
                            <span className="font-mono text-[13px] font-bold">
                              {item.step}
                            </span>
                          </div>
                          <div className="h-[1px] flex-1 bg-[var(--border)]" />
                        </div>

                        <div
                          className="saas-card !p-8 md:!p-10"
                          style={{
                            borderColor: `color-mix(in srgb, ${item.accent} 25%, var(--border))`,
                          }}
                        >
                          <div
                            className={`flex items-center gap-3 mb-5 ${
                              isEven ? "md:justify-end" : ""
                            }`}
                          >
                            <div
                              className="icon-box"
                              style={{
                                borderColor: `color-mix(in srgb, ${item.accent} 40%, var(--border))`,
                              }}
                            >
                              {item.icon}
                            </div>
                            <h3 className="text-[20px] sm:text-[22px] font-bold text-[var(--text-primary)] tracking-[-0.02em]">
                              {item.title}
                            </h3>
                          </div>

                          <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-6">
                            {item.desc}
                          </p>

                          <ul
                            className={`space-y-3 ${
                              isEven ? "md:text-right" : ""
                            }`}
                          >
                            {item.details.map((detail) => (
                              <li
                                key={detail}
                                className={`flex items-center gap-2.5 text-[14px] text-[var(--text-muted)] ${
                                  isEven ? "md:flex-row-reverse" : ""
                                }`}
                              >
                                <CheckCircle2
                                  size={15}
                                  className="text-[var(--accent)] shrink-0"
                                />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Spacer for the other side */}
                      <div className="hidden md:block flex-1" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Under the hood ─────────────────────────────────────────────── */}
        <Section className="py-16 sm:py-24 md:py-32 bg-[var(--bg-subtle)] border-y border-[var(--border)]">
          <div className="page-shell max-w-[900px] mx-auto">
            <div className="text-center mb-14">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--text-faint)] border border-[var(--border)] px-3 py-1.5 inline-block rounded-sm mb-5">
                Under the hood
              </span>
              <h2 className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.03em] text-[var(--text-primary)] mb-4">
                Built for speed and accuracy
              </h2>
              <p className="text-[16px] text-[var(--text-muted)] max-w-[500px] mx-auto leading-relaxed">
                A look at the technology powering Synapse&apos;s note generation pipeline.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  icon: <Youtube size={20} />,
                  title: "Transcript Extraction",
                  desc: "Multi-method transcript fetching with automatic fallback to subtitle parsing via yt-dlp when direct API access is unavailable.",
                },
                {
                  icon: <Brain size={20} />,
                  title: "Llama 3.3 70B via Groq",
                  desc: "Inference at ~500 tokens/sec. The model understands context, identifies code blocks, and structures content hierarchically.",
                },
                {
                  icon: <Code2 size={20} />,
                  title: "Smart Code Detection",
                  desc: "Automatic language identification and syntax-aware formatting for every code snippet mentioned in the video.",
                },
                {
                  icon: <Layers size={20} />,
                  title: "Structured Output",
                  desc: "JSON-mode response ensures reliable, consistent note structure with titles, summaries, sections, and key takeaways.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="saas-card"
                >
                  <div className="icon-box mb-5">{item.icon}</div>
                  <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Language Support ─────────────────────────────────────────── */}
        <Section className="py-16 sm:py-24 md:py-32">
          <div className="page-shell max-w-[900px] mx-auto">
            <div className="text-center mb-14">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--text-faint)] border border-[var(--border)] px-3 py-1.5 inline-block rounded-sm mb-5">
                <Globe size={11} className="inline -mt-0.5 mr-1.5" />
                Language Support
              </span>
              <h2 className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.03em] text-[var(--text-primary)] mb-4">
                Notes in your language
              </h2>
              <p className="text-[16px] text-[var(--text-muted)] max-w-[520px] mx-auto leading-relaxed">
                Synapse can generate notes in multiple languages regardless of the video&apos;s original language. Watch in English, get notes in Hindi — or any combination.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  code: "EN",
                  name: "English",
                  native: "English",
                  sample: "Structured study notes generated from video content.",
                  status: "stable" as const,
                },
                {
                  code: "HI",
                  name: "Hindi",
                  native: "हिन्दी",
                  sample: "वीडियो सामग्री से संरचित अध्ययन नोट्स उत्पन्न।",
                  status: "stable" as const,
                },
                {
                  code: "HI-EN",
                  name: "Hinglish",
                  native: "Hindi + English",
                  sample: "Video content se structured study notes generate kiye gaye.",
                  status: "stable" as const,
                },
              ].map((lang, index) => (
                <motion.div
                  key={lang.code}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="saas-card !p-6 group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[14px] font-bold text-[var(--text-primary)] bg-[var(--bg-subtle)] border border-[var(--border)] px-2.5 py-1 rounded-sm shadow-[2px_2px_0_0_var(--border)]">
                        {lang.code}
                      </span>
                      <div>
                        <p className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">
                          {lang.name}
                        </p>
                        <p className="text-[12px] text-[var(--text-faint)] font-mono">
                          {lang.native}
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--text-faint)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--mac-green)]" />
                      {lang.status}
                    </span>
                  </div>
                  <p
                    className="text-[13px] text-[var(--text-muted)] leading-relaxed italic border-l-2 border-[var(--border)] pl-3"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    &ldquo;{lang.sample}&rdquo;
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-[13px] text-[var(--text-faint)] leading-relaxed max-w-[500px] mx-auto">
                Input language is auto-detected from the video transcript. Output language is selected by you on the generate page. Code blocks always stay in their original programming language.
              </p>
            </div>
          </div>
        </Section>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <Section className="py-20 sm:py-28 md:py-36">
          <div className="page-shell max-w-[700px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="saas-card !p-10 sm:!p-14 md:!p-16 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <Sparkles size={128} />
              </div>
              <h2 className="text-[clamp(26px,4vw,40px)] font-bold tracking-[-0.03em] text-[var(--text-primary)] mb-4">
                Ready to try it?
              </h2>
              <p className="text-[16px] text-[var(--text-muted)] max-w-[440px] mx-auto leading-relaxed mb-8">
                Paste any YouTube URL and get structured, AI-powered notes in
                under 5 seconds. No sign-up required.
              </p>
              <Link
                href="/generate"
                className="btn-primary text-[15px] inline-flex mx-auto"
              >
                Generate Notes Now{" "}
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            </motion.div>
          </div>
        </Section>
      </div>
    </main>
  );
}
