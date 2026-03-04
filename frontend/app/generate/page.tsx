"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, ArrowRight, Check } from "lucide-react";

type GeneratedBlock =
    | { type: "heading"; content: string }
    | { type: "paragraph"; content: string }
    | { type: "bullet"; items: string[] }
    | { type: "code"; language?: string; content: string }
    | { type: "timestamp"; time: string; topic: string };

type GeneratedResponse =
    | {
        metadata?: { title?: string; duration?: string; channel?: string };
        blocks: GeneratedBlock[];
    }
    | { raw: string };

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

export default function GeneratePage() {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<GeneratedResponse | null>(null);
    const [copied, setCopied] = useState(false);

    /** Convert blocks to clean Markdown text */
    const blocksToMarkdown = (): string => {
        if (!data || !('blocks' in data)) return '';
        const meta = 'metadata' in data ? data.metadata : null;
        const lines: string[] = [];

        if (meta?.title) lines.push(`# ${meta.title}`, '');
        if (meta?.channel || meta?.duration)
            lines.push(`> ${meta.channel || 'YouTube'} · ${meta.duration || ''}`, '');

        for (const block of data.blocks) {
            switch (block.type) {
                case 'heading':  lines.push(`## ${block.content}`, ''); break;
                case 'paragraph': lines.push(block.content, ''); break;
                case 'bullet':
                    for (const item of block.items) lines.push(`- ${item}`);
                    lines.push('');
                    break;
                case 'code':
                    lines.push(`\`\`\`${block.language || ''}`, block.content, '\`\`\`', '');
                    break;
                case 'timestamp':
                    lines.push(`- **\`${block.time}\`** — _${block.topic}_`);
                    break;
            }
        }
        return lines.join('\n').trim();
    };

    const handleCopy = async () => {
        const md = blocksToMarkdown();
        await navigator.clipboard.writeText(md);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const md = blocksToMarkdown();
        const title = (data && 'metadata' in data && data.metadata?.title)
            ? data.metadata.title.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '-')
            : 'synapse-notes';
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/generate-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url.trim() }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => null);
                const detail = payload?.detail;
                const message = typeof detail === "string"
                    ? detail
                    : detail?.message || "Failed to generate notes.";
                throw new Error(message);
            }

            const json = (await res.json()) as GeneratedResponse;
            setData(json);
        } catch (err: any) {
            setError(err.message ?? "Something went wrong while generating notes.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[var(--bg)] selection:bg-[var(--accent-soft)] selection:text-[var(--text-primary)] overflow-hidden relative">
            {/* Background Texture & Decor */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] hero-noise mix-blend-overlay" />
            <SketchLoop className="w-[400px] h-[400px] -top-20 -right-20 rotate-12" />
            <SketchLoop className="w-[500px] h-[500px] -bottom-40 -left-40 -rotate-12" />

            <div className="relative z-10">
                <Navbar />

                <section className="page-shell pt-24 pb-36 md:pt-40">
                    <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-16 lg:gap-24">
                        {/* Left Column: Controls */}
                        <div className="flex flex-col justify-center">
                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                custom={0}
                                className="mb-8"
                            >
                                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--text-faint)] border border-[var(--border)] px-3 py-1.5 inline-block rounded-sm">
                                    Extraction Engine
                                </span>
                            </motion.div>

                            <motion.h1
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                custom={0.1}
                                className="text-[clamp(48px,5vw,72px)] font-light leading-[1.05] tracking-[-0.03em] text-[var(--text-primary)] mb-6 font-[var(--font-sans)]"
                            >
                                Knowledge <br />
                                <span className="italic font-[var(--font-serif)] relative inline-block">
                                    Distillation.
                                    <SketchUnderline />
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                custom={0.2}
                                className="text-[16px] font-normal leading-[1.75] text-[var(--text-muted)] mb-12 max-w-[420px]"
                            >
                                Paste any public YouTube URL. We pull the transcript, distill the structure, and hand you clean notes
                                ready for Notion.
                            </motion.p>

                            <motion.form
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                custom={0.3}
                                onSubmit={handleGenerate}
                                className="flex flex-col gap-8 mb-12 w-full max-w-[420px]"
                            >
                                <div className="group border-b border-[var(--border)] focus-within:border-[var(--text-primary)] transition-colors duration-200">
                                    <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-faint)] block mb-1">
                                        Source URL
                                    </label>
                                    <input
                                        type="text"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="Paste YouTube link here..."
                                        className="w-full bg-transparent py-4 text-[15px] font-normal text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-faint)]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !url}
                                    className="w-fit flex items-center gap-2 text-[15px] font-medium text-[var(--text-primary)] group disabled:opacity-30"
                                >
                                    {isLoading ? "Processing..." : "Generate Notes"}
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.form>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="mt-2 text-[13px] text-red-500 font-mono"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </div>

                        {/* Right Column: Result */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="min-h-[500px] h-full flex items-stretch"
                        >
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center h-full pt-20 gap-6"
                                    >
                                        <div className="w-10 h-10 border border-[var(--border)] border-t-[var(--text-primary)] rounded-full animate-spin" />
                                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                                            Generating structured notes
                                        </span>
                                    </motion.div>
                                ) : data ? (
                                    <motion.div
                                        key="notes"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-[var(--bg-subtle)] border border-[var(--border)] p-12 md:p-20"
                                    >
                                        {/* Note Header */}
                                        <div className="mb-16 pb-12 border-b border-[var(--border)]">
                                            <div className="flex justify-between items-start mb-12">
                                                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                                                    Generated Output
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleCopy}
                                                        className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-primary)] border border-[var(--border)] px-4 py-2 hover:bg-[var(--bg)] transition-colors"
                                                    >
                                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                                        {copied ? "Copied!" : "Copy"}
                                                    </button>
                                                    <button
                                                        onClick={handleDownload}
                                                        className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-primary)] border border-[var(--border)] px-4 py-2 hover:bg-[var(--bg)] transition-colors"
                                                    >
                                                        <Download size={14} /> Download .md
                                                    </button>
                                                </div>
                                            </div>
                                            <h2 className="text-[40px] font-light text-[var(--text-primary)] leading-tight mb-8 font-[var(--font-serif)]">
                                                {("metadata" in data && data.metadata?.title) || "Generated Notes"}
                                            </h2>
                                            <div className="flex gap-12">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-[10px] uppercase text-[var(--text-faint)]">Channel</span>
                                                    <span className="text-[14px]">
                                                        {("metadata" in data && data.metadata?.channel) || "YouTube"}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-[10px] uppercase text-[var(--text-faint)]">Length</span>
                                                    <span className="text-[14px]">
                                                        {("metadata" in data && data.metadata?.duration) || "—"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Note Content */}
                                        <div className="space-y-12 max-w-[600px]">
                                            {"blocks" in data &&
                                                data.blocks?.map((block, i) => (
                                                    <NoteBlock key={i} block={block} />
                                                ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center border border-dashed border-[var(--border)] rounded-2xl p-12 lg:p-20 opacity-40 bg-[var(--bg-card)]/50">
                                        <span className="font-serif italic text-2xl text-[var(--text-muted)] text-center max-w-[300px] leading-relaxed">
                                            Distill time into wisdom. <br />
                                            Paste a link to begin.
                                        </span>
                                    </div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function NoteBlock({ block }: { block: any }) {
    switch (block.type) {
        case "heading":
            return <h3 className="font-sans text-[22px] font-semibold text-[var(--text-primary)] mt-12 mb-6">{block.content}</h3>;
        case "paragraph":
            return <p className="text-[16px] font-normal leading-[1.8] text-[var(--text-muted)] mb-6">{block.content}</p>;
        case "bullet":
            return (
                <ul className="space-y-4 mb-8">
                    {block.items.map((item: string, i: number) => (
                        <li key={i} className="flex gap-6 items-start">
                            <span className="font-mono text-[11px] text-[var(--text-faint)] mt-1.5">0{i + 1}</span>
                            <span className="text-[15px] text-[var(--text-primary)] leading-relaxed">{item}</span>
                        </li>
                    ))}
                </ul>
            );
        case "code":
            return (
                <div className="my-10 bg-[var(--bg)] border border-[var(--border)] p-8 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
                            {block.language || "syntax"} block
                        </span>
                    </div>
                    <pre className="overflow-x-auto">
                        <code className="font-mono text-[13px] leading-6 text-[var(--text-primary)]">{block.content}</code>
                    </pre>
                </div>
            );
        case "timestamp":
            return (
                <div className="flex gap-4 items-center my-6 group cursor-pointer w-fit">
                    <span className="font-mono text-[11px] font-bold text-[var(--text-primary)] bg-[var(--border)] px-2 py-0.5">
                        {block.time}
                    </span>
                    <span className="text-[14px] font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors italic font-serif">
                        {block.topic}
                    </span>
                </div>
            );
        default:
            return null;
    }
}
