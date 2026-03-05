"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import API_BASE from "@/lib/api";
import {
  ArrowRight,
  Zap,
  Brain,
  CheckCircle2,
  Star,
  Youtube,
  FileText,
  Layers,
  Clock,
  Sparkles,
  ShieldCheck,
  Code2,
  Lock,
  ChevronRight,
  Mail,
  Linkedin,
  MessageCircle
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FormEvent, useEffect, useRef, useState } from "react";

/* ─── Animation Variants ─────────────────────────────────────────────────── */
const fadeUp: any = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay },
  }),
};

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section
      id={id}
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
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
    </svg>
  );
}

function SketchArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 60"
      fill="none"
      stroke="currentColor"
      className={`w-24 h-16 text-[var(--accent)] opacity-40 ${className}`}
    >
      <motion.path
        d="M10,10 C40,5 60,20 70,50 M60,40 L70,50 L80,45"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
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
        strokeWidth="1"
        initial={{ pathLength: 0, scale: 0.8 }}
        animate={{
          pathLength: [0, 1, 1, 0],
          rotate: [0, 5, -5, 0],
          scale: [0.8, 1, 0.9, 0.8]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </svg>
  );
}

function SketchHighlight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 40"
      fill="none"
      stroke="currentColor"
      className={`absolute inset-0 w-full h-full text-[var(--accent)] opacity-30 pointer-events-none -mx-2 -my-1 ${className}`}
    >
      <motion.path
        d="M5,20 C5,5 95,5 95,20 C95,35 5,35 5,20"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  );
}

/* ─── Fake UI Preview ─────────────────────────────────────────────────────── */
function ProductPreview() {
  return (
    <div className="relative w-full max-w-[560px] mx-auto px-4 sm:px-0">
      {/* Main card */}
      <div
        className="relative rounded-2xl border border-[var(--border)] overflow-hidden shadow-[0_20px_50px_-12px_var(--accent-glow)]"
        style={{ background: "var(--bg-card)" }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="w-3 h-3 rounded-full shadow-inner" style={{ background: "var(--mac-red)" }} />
          <div className="w-3 h-3 rounded-full shadow-inner" style={{ background: "var(--mac-yellow)" }} />
          <div className="w-3 h-3 rounded-full shadow-inner" style={{ background: "var(--mac-green)" }} />
          <div className="flex-1 mx-4 h-6 rounded-md bg-[var(--border)]/50 border border-[var(--border)] flex items-center px-3 overflow-hidden">
            <span className="text-[11px] text-[var(--text-faint)] font-mono truncate">notion.so/my-notes/synapse-output</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[var(--accent)]" />
            <span className="text-[15px] font-semibold text-[var(--text-primary)]">
              Next.js Tutorial — Full Course
            </span>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2">
            {["Next.js", "React", "TypeScript", "3h 42m"].map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-[var(--border)] bg-[var(--bg-subtle)]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Notes rows */}
          {[
            { time: "0:02:30", content: "Introduction to App Router and file-based routing" },
            { time: "0:14:45", content: "Server components vs Client components explained" },
            { time: "0:31:10", content: "Data fetching with async/await and Suspense" },
          ].map((note) => (
            <div
              key={note.time}
              className="flex gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]"
            >
              <span
                className="text-[11px] font-mono font-medium shrink-0 mt-0.5 px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--text-primary)] text-[var(--bg)]"
              >
                {note.time}
              </span>
              <span className="text-[13px] text-[var(--text-muted)] leading-relaxed">{note.content}</span>
            </div>
          ))}

          {/* Code block */}
          <div
            className="rounded-xl p-4 font-mono text-[12px] relative overflow-hidden"
            style={{ background: "#0d0d0d", color: "#e5e5e5" }}
          >
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Code2 size={40} className="text-[var(--accent)]" />
            </div>
            <div style={{ color: "#737373" }}>{`// Generated code snippet`}</div>
            <div>
              <span style={{ color: "var(--accent)" }}>export default</span>{" "}
              <span style={{ color: "#ffffff" }}>async function</span>{" "}
              <span style={{ color: "#ffffff" }}>Page</span>
              {"() {"}
            </div>
            <div className="pl-4">
              <span style={{ color: "var(--accent)" }}>const</span>{" "}
              <span style={{ color: "#ffffff" }}>data</span>{" "}
              <span style={{ color: "#737373" }}>=</span>{" "}
              <span style={{ color: "#ffffff" }}>await</span>{" "}
              <span style={{ color: "#ffffff" }}>fetch</span>
              {"(url)"}
            </div>
            <div>{"}"}</div>
          </div>

          {/* Bottom status */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: "var(--mac-green)" }} />
              <span className="text-[12px] text-[var(--text-faint)]">Synced to Notion</span>
            </div>
            <span className="text-[11px] text-[var(--text-faint)] font-mono">Generated in 4.2s</span>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="absolute -top-4 -right-1 sm:-right-4 md:-right-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-[var(--shadow-md)] flex items-center gap-2 text-[12px] sm:text-[13px]"
      >
        <CheckCircle2 size={16} className="text-black" />
        <span className="font-medium text-[var(--text-primary)]">Notes ready!</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute -bottom-5 -left-1 sm:-left-4 md:-left-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-[0_8px_30px_var(--accent-glow)] flex items-center gap-2 text-[12px] sm:text-[13px]"
      >
        <Zap size={16} className="text-[var(--accent)]" />
        <span className="font-medium text-[var(--text-primary)]">4.2s generation</span>
      </motion.div>
    </div>
  );
}

/* ─── Feedback Types ──────────────────────────────────────────────────────── */
type FeedbackItemType = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

/* ─── Feedback Form ───────────────────────────────────────────────────────── */
function FeedbackForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFeedback = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setError(null);

    try {
      const res = await fetch(API_BASE + "/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "Anonymous", message: message.trim() }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
      setMessage("");
      setName("");
      onSubmitted?.();
    } catch {
      setError("Could not submit feedback. Please try again.");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleFeedback}>
      <div className="relative">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full bg-transparent text-[15px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-faint)] border-b border-[var(--border)] pb-3 mb-4 font-medium"
        />
      </div>
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => { setMessage(e.target.value); setSubmitted(false); setError(null); }}
          placeholder="What's on your mind? (e.g. 'I'd love a Chrome extension for quick captures')"
          className="w-full min-h-[130px] bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-faint)] resize-none leading-relaxed font-serif italic"
          style={{ fontFamily: "var(--font-serif)" }}
        />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] dot-grid" />
      </div>

      {error && <p className="text-[13px] text-red-500 font-mono">{error}</p>}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-6 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-faint)]">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          {submitted ? "Thank you! Your feedback is live." : "Your voice shapes Synapse"}
        </div>
        <button
          type="submit"
          disabled={!message.trim()}
          className="btn-primary !rounded-lg !px-10 group/btn bg-[var(--text-primary)] !text-[var(--bg)] border-none shadow-[4px_4px_0_0_var(--accent)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40"
        >
          {submitted ? "Sent!" : "Send Feedback"}
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </form>
  );
}

/* ─── Feedback Carousel (sliding left-to-right) ───────────────────────────── */
function FeedbackCarousel({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<FeedbackItemType[]>([]);

  useEffect(() => {
    fetch(API_BASE + "/feedback")
      .then((r) => r.json())
      .then((data) => setItems(data.feedback || []))
      .catch(() => { });
  }, [refreshKey]);

  if (items.length === 0) return null;

  // For few items, show them statically (no animation that scrolls them away)
  const shouldAnimate = items.length >= 3;
  // Double only when animating for seamless infinite scroll
  const displayItems = shouldAnimate ? [...items, ...items] : items;

  return (
    <div className="mt-10 sm:mt-16 overflow-hidden">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle size={16} className="text-[var(--text-faint)]" />
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--text-faint)]">
          What users are saying ({items.length})
        </span>
      </div>
      <div className="relative">
        {/* Fade edges — only when animating */}
        {shouldAnimate && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--bg)] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--bg)] to-transparent z-10 pointer-events-none" />
          </>
        )}
        <motion.div
          className="flex gap-6"
          {...(shouldAnimate
            ? {
              animate: { x: ["-0%", "-50%"] },
              transition: {
                x: {
                  duration: Math.max(items.length * 6, 20),
                  ease: "linear",
                  repeat: Infinity,
                },
              },
            }
            : {})}
        >
          {displayItems.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="flex-shrink-0 w-[260px] sm:w-[320px] bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl p-5 sm:p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[13px] font-bold text-[var(--text-primary)]">
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--text-primary)] leading-tight">{item.name}</p>
                  <p className="text-[11px] font-mono text-[var(--text-faint)]">
                    {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <p className="text-[14px] text-[var(--text-muted)] leading-relaxed line-clamp-4 italic font-serif" style={{ fontFamily: "var(--font-serif)" }}>
                "{item.message}"
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackRefreshKey, setFeedbackRefreshKey] = useState(0);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!url.trim()) return;
    setIsLoading(true);
    const params = new URLSearchParams({ url: url.trim() });
    router.push(`/generate?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 md:pt-36 md:pb-44 overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        {/* Background Sketch Decor */}
        <SketchLoop className="w-[300px] h-[300px] -top-20 -left-10 rotate-12" />
        <SketchLoop className="w-[400px] h-[400px] -bottom-40 -right-20 -rotate-12" />
        <SketchArrow className="absolute top-1/4 right-[15%] hidden lg:block" />

        <div className="page-shell relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 sm:gap-16 lg:gap-16">
            {/* Left */}
            <div className="flex-1 text-center lg:text-left max-w-[580px] mx-auto lg:mx-0">
              {/* Badge */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0}
                className="flex justify-center lg:justify-start mb-8"
              >
                <span className="badge relative group">
                  <Sparkles size={12} className="shrink-0" />
                  Powered by GPT-3.5 Turbo&nbsp;·&nbsp;Notion API
                  <SketchHighlight className="group-hover:opacity-60 transition-opacity" />
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.1}
                className="text-[clamp(42px,6vw,76px)] leading-[1.05] tracking-[-0.04em] font-bold text-[var(--text-primary)] mb-6"
              >
                Turn YouTube
                <br />
                tutorials
                <br />
                into Notion
                <br />
                <span
                  className="italic font-light relative"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  notes.
                  <SketchUnderline className="text-[var(--accent-vibrant)]" />
                </span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.2}
                className="text-[18px] font-normal leading-[1.75] text-[var(--text-muted)] mb-10 max-w-[460px] mx-auto lg:mx-0"
              >
                Paste any YouTube URL. Synapse extracts the transcript, structures it with AI, and pushes formatted notes directly into your Notion workspace — in seconds.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.3}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12"
              >
                <Link href="/generate" className="btn-primary text-[15px] w-full sm:w-auto justify-center">
                  Start for Free <ArrowRight size={15} strokeWidth={2.5} />
                </Link>
                <Link href="/how-it-works" className="btn-secondary text-[15px] w-full sm:w-auto justify-center">
                  See how it works
                </Link>
              </motion.div>

              {/* Trust signals */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.4}
                className="flex items-center justify-center lg:justify-start gap-6 flex-wrap"
              >
                {[
                  { icon: <ShieldCheck size={14} />, text: "No account needed to try" },
                  { icon: <Clock size={14} />, text: "< 5 seconds" },
                  { icon: <Lock size={14} />, text: "Notion OAuth" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-1.5 text-[13px] text-[var(--text-muted)]">
                    <span className="text-[var(--text-primary)]">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right – product preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex-1 w-full flex justify-center lg:justify-end"
            >
              <ProductPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <Section id="how-it-works" className="py-28 md:py-40">
        <div className="page-shell">
          <div className="text-center mb-20">
            <span className="badge mb-5 inline-flex">Process</span>
            <h2 className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.03em] text-[var(--text-primary)] mb-4">
              Three steps to structured knowledge
            </h2>
            <p className="text-[16px] text-[var(--text-muted)] max-w-[480px] mx-auto leading-relaxed">
              From raw video to polished Notion notes without touching a keyboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: <Youtube size={22} />,
                title: "Paste & Capture",
                desc: "Drop any public YouTube URL. We extract transcript tokens in under 5 seconds — no downloads, no browser extensions.",
              },
              {
                step: "02",
                icon: <Brain size={22} />,
                title: "AI Refines",
                desc: "GPT-3.5 Turbo restructures the content into logical sections, timestamps, code blocks, and key takeaways.",
              },
              {
                step: "03",
                icon: <Layers size={22} />,
                title: "Notion Sync",
                desc: "A fully-formatted, searchable Notion page is created in your workspace using the official Notion API.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="saas-card flex flex-col gap-5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="icon-box">
                    {item.icon}
                  </div>
                  <span className="font-mono text-[42px] font-bold text-[var(--border)] leading-none">
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
                  <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-auto flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more <ChevronRight size={13} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <Section id="features" className="py-28 md:py-40 bg-[var(--bg-subtle)] border-y border-[var(--border)]">
        <div className="page-shell">
          <div className="text-center mb-20">
            <span className="badge mb-5 inline-flex">Why Synapse</span>
            <h2 className="text-[clamp(32px,4vw,48px)] font-bold tracking-[-0.04em] text-[var(--text-primary)] mb-4">
              The intelligence layer between video and knowledge
            </h2>
            <p className="text-[16px] text-[var(--text-muted)] max-w-[520px] mx-auto leading-relaxed">
              Built for developers and learners who are tired of watching the same tutorial twice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Sparkles size={20} />,
                title: "Contextual Understanding",
                desc: "Our AI doesn't just transcribe. It understands the narrative arc and organizes content intelligently.",
              },
              {
                icon: <Code2 size={20} />,
                title: "Code-First Formatting",
                desc: "Automatic syntax detection and formatting for every code snippet mentioned in the video.",
              },
              {
                icon: <Layers size={20} />,
                title: "Notion Native",
                desc: "Uses official Notion block types — toggle blocks, code blocks, callouts. No copy-pasting.",
              },
              {
                icon: <Clock size={20} />,
                title: "Timestamped Notes",
                desc: "Every section links back to the exact moment in the video. Jump to context in one click.",
              },
              {
                icon: <Brain size={20} />,
                title: "Key Takeaways",
                desc: "AI extracts the top insights and concepts from any tutorial automatically.",
              },
              {
                icon: <ShieldCheck size={20} />,
                title: "No Lock-in",
                desc: "Your notes live in your Notion workspace. Export, share, or delete anytime. Your data, your rules.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="saas-card"
              >
                <div className="icon-box mb-5">{feature.icon}</div>
                <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Feedback Section (Paper Side-by-Side) ────────────────────────── */}
      <Section id="feedback" className="py-16 sm:py-28 md:py-48 bg-[var(--bg-subtle)]/30">
        <div className="page-shell">
          <div className="max-w-[1000px] mx-auto">
            <div className="flex flex-col md:flex-row items-stretch feedback-paper rounded-3xl overflow-hidden md:min-h-[580px]">
              {/* Image Side */}
              <div className="w-full h-[200px] sm:h-[260px] md:h-auto md:w-5/12 relative border-b-[1.5px] md:border-b-0 md:border-r-[1.5px] border-[var(--border)] group">
                <Image
                  src="/assets/feedback.jpeg"
                  alt="Building Synapse"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/80 via-transparent to-transparent md:hidden" />
              </div>

              {/* Form Side */}
              <div className="w-full md:w-7/12 flex flex-col">
                <div className="paper-header">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--mac-red)] opacity-60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--mac-yellow)] opacity-60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--mac-green)] opacity-60" />
                  </div>
                  <div className="h-4 w-[1px] bg-[var(--border)] mx-2" />
                  <span className="text-[11px] font-mono text-[var(--text-faint)] uppercase tracking-widest">Feedback / draft_02.md</span>
                </div>

                <div className="p-5 sm:p-8 md:p-12 flex-1 flex flex-col justify-center">
                  <div className="mb-10 relative">

                    <h2 className="text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.04em] text-[var(--text-primary)] mb-4 relative inline-block">
                      Help us build the <br className="hidden md:block" /> intelligence layer.
                      <SketchUnderline className="opacity-40" />
                    </h2>
                    <SketchArrow className="absolute -right-16 top-0 rotate-45 opacity-20 hidden lg:block" />
                  </div>
                  <FeedbackForm onSubmitted={() => setFeedbackRefreshKey((k) => k + 1)} />
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Carousel */}
          <FeedbackCarousel refreshKey={feedbackRefreshKey} />
        </div>
      </Section>


      <footer className="border-t border-[var(--border)] bg-[var(--bg)] pt-16 sm:pt-24 lg:pt-32 pb-12 sm:pb-16">
        <div className="page-shell">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-y-12 sm:gap-y-16 gap-x-8 sm:gap-x-12 mb-16 sm:mb-24">
            {/* Brand column */}
            <div className="col-span-2 lg:col-span-4">
              <Link href="/" className="flex items-center gap-3 group mb-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-[4px] border-[2px] border-[var(--text-primary)] bg-[var(--bg)] shadow-[4px_4px_0_0_var(--text-primary)]">
                  <span className="font-serif font-black text-[24px] leading-none mb-[2px]" style={{ fontFamily: "var(--font-serif)" }}>S</span>
                </div>
                <span className="font-bold text-[28px] tracking-[-0.05em] text-[var(--text-primary)]">Synapse</span>
              </Link>
              <p className="text-[16px] text-[var(--text-muted)] leading-relaxed max-w-[360px] mb-12 font-medium opacity-90">
                Building the intelligence layer between video and knowledge. Designed for the curious, the fast, and the focused.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://linkedin.com/in/abdullah-parvez-565693246/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border-[1.5px] border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-all cursor-pointer shadow-sm">
                  <Linkedin size={20} />
                </a>
                <a href="mailto:abdullahbuilds786@gmail.com" className="w-12 h-12 rounded-full border-[1.5px] border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-all cursor-pointer shadow-sm">
                  <Mail size={20} />
                </a>
              </div>
            </div>

            {/* Links columns */}
            <div className="lg:col-span-2">
              <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)] font-mono mb-10">
                Product
              </h4>
              <ul className="space-y-5">
                {[
                  { name: "Features", href: "/#features" },
                  { name: "Philosophy", href: "/philosophy" },
                  { name: "Generate Notes", href: "/generate" },
                  { name: "Feedback", href: "/#feedback" }
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-[15px] text-[var(--text-muted)] font-medium hover:text-[var(--text-primary)] transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)] font-mono mb-10">
                Resources
              </h4>
              <ul className="space-y-5">
                {[
                  { name: "How It Works", href: "/how-it-works" },
                  { name: "Philosophy", href: "/philosophy" },
                  { name: "Contact", href: "mailto:abdullahbuilds786@gmail.com" },
                  { name: "LinkedIn", href: "https://linkedin.com/in/abdullah-parvez-565693246/" }
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-[15px] text-[var(--text-muted)] font-medium hover:text-[var(--text-primary)] transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Architect Card */}
            <div className="col-span-2 lg:col-span-4 lg:pl-12">
              <div className="p-8 bg-[var(--bg-subtle)] border-[1.5px] border-[var(--border)] rounded-2xl shadow-[8px_8px_0_0_var(--border)]">
                <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)] font-mono mb-8">
                  Architect
                </h4>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 relative rounded-full border-[2px] border-[var(--text-primary)] shadow-[4px_4px_0_0_var(--text-primary)] overflow-hidden shrink-0">
                    <Image
                      src="/assets/abdullah.png"
                      alt="Abdullah Parvez"
                      fill
                      className="object-cover contrast-110"
                    />
                  </div>
                  <div>
                    <a href="https://www.linkedin.com/in/abdullah-parvez-565693246/" target="_blank" rel="noopener noreferrer" className="text-[18px] text-[var(--text-primary)] font-bold hover:text-[var(--accent)] transition-colors block mb-1">
                      Abdullah Parvez
                    </a>
                    <p className="text-[13px] text-[var(--text-muted)] font-mono">Founding Systems Engineer</p>
                  </div>
                </div>
                <a href="mailto:abdullahbuilds786@gmail.com" className="btn-primary !py-2.5 !text-[13px] w-full border-none bg-[var(--text-primary)] text-[var(--bg)] shadow-[4px_4px_0_0_var(--accent)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  Get in Touch
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 sm:gap-8 pt-12 border-t border-[var(--border)] md:flex-row md:justify-between">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-10">
              <span className="text-[14px] text-[var(--text-faint)] font-mono">© 2026 Synapse</span>
              <div className="flex items-center gap-2.5 text-[14px] text-[var(--text-faint)] font-mono">
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span>Global Nodes Online</span>
              </div>
              <a href="/#features" className="text-[14px] text-[var(--text-faint)] hover:text-[var(--text-primary)] font-mono transition-colors">Features</a>
              <a href="/#feedback" className="text-[14px] text-[var(--text-faint)] hover:text-[var(--text-primary)] font-mono transition-colors">Feedback</a>
            </div>
            <div className="text-[14px] text-[var(--text-faint)] font-mono text-center md:text-right italic">
              Built with precision. For those who seek depth.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
