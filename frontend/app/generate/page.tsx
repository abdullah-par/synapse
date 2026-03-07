"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Navbar } from "@/components/navbar";
import API_BASE from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, ArrowRight, Check, Clock, Zap, Sparkles, Youtube } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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

const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    show: (delay = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay },
    }),
};

import { SketchUnderline, SketchLoop, SketchBox } from "@/components/decorations";

export default function GeneratePage() {
    const [url, setUrl] = useState("");
    const [outputLanguage, setOutputLanguage] = useState("english");
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
                case 'heading': lines.push(`## ${block.content}`, ''); break;
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
            const res = await fetch(API_BASE + "/generate-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url.trim(), output_language: outputLanguage }),
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
            <SketchLoop className="w-[300px] h-[300px] top-40 left-[5%] rotate-12" color="blue" />
            <SketchLoop className="w-[450px] h-[450px] top-60 right-[2%] -rotate-12" color="pink" />
            <SketchLoop className="w-[350px] h-[350px] bottom-20 right-[15%] rotate-45" color="orange" />
            <SketchBox className="w-[200px] h-[200px] top-[20%] left-[20%] -rotate-6" color="purple" />
            <SketchBox className="w-[250px] h-[250px] bottom-[10%] left-[10%] rotate-12" color="green" />

            <div className="relative z-10">
                <Navbar />

                <section className="page-shell pt-16 pb-20 md:pt-24 lg:pt-40 md:pb-36 max-w-[1000px] mx-auto text-center flex flex-col items-center">
                    {/* Header: Exact match to How It Works */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={0}
                        className="mb-8 flex justify-center"
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
                        className="text-[clamp(32px,4vw,64px)] font-bold leading-tight tracking-[-0.03em] text-[var(--text-primary)] mb-6 whitespace-nowrap"
                    >
                        Knowledge{" "}
                        <span className="italic font-light relative" style={{ fontFamily: "var(--font-serif)" }}>
                            Distillation.
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
                        Paste any public YouTube URL. We pull the transcript, distill the structure, and hand you clean notes
                        ready for Notion.
                    </motion.p>

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={0.25}
                        className="flex items-center justify-center gap-6 flex-wrap text-[13px] text-[var(--text-muted)] mb-12"
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

                    <motion.form
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={0.3}
                        onSubmit={handleGenerate}
                        className="flex flex-col gap-9 w-full max-w-[560px] mx-auto p-8 md:p-10 saas-card !rounded-[24px] mb-12 text-left"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="icon-box">
                                <Youtube size={24} />
                            </div>
                            <h2 className="text-[22px] font-bold text-[var(--text-primary)] tracking-[-0.03em]">
                                Prepare Extraction
                            </h2>
                        </div>

                        <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-4">
                            Synapse will analyze the full transcript and restructure the content into beautifully formatted notes.
                        </p>

                        <div className="space-y-6">
                            <div className="group transition-all duration-300">
                                <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-faint)] block mb-1">
                                    Source URL
                                </label>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Paste YouTube link here..."
                                    className="w-full bg-transparent py-4 text-[16px] font-normal text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-faint)]"
                                />
                            </div>

                            <div className="flex flex-col gap-4">
                                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-faint)]">
                                    Output Language
                                </span>
                                <div className="flex gap-3 flex-wrap">
                                    {[
                                        { value: "english", label: "English" },
                                        { value: "hindi", label: "Hindi" },
                                        { value: "hinglish", label: "Hinglish" },
                                    ].map((lang) => (
                                        <button
                                            key={lang.value}
                                            type="button"
                                            onClick={() => setOutputLanguage(lang.value)}
                                            className={`px-3.5 py-1.5 text-[12px] font-mono font-bold border-[1.5px] rounded-sm transition-all duration-300 ${outputLanguage === lang.value
                                                ? "border-[var(--text-primary)] text-[var(--text-primary)] bg-[var(--bg-subtle)] shadow-[3px_3px_0_0_var(--text-primary)] translate-x-[1px] translate-y-[1px]"
                                                : "border-[var(--border)] text-[var(--text-faint)] bg-[var(--bg)] shadow-[2px_2px_0_0_var(--border)] hover:border-[var(--text-muted)] hover:shadow-[2px_2px_0_0_var(--text-muted)]"
                                                }`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !url}
                            className="inline-flex btn-primary text-[15px] !rounded-[10px] w-full justify-center disabled:opacity-30 group mt-4 h-14"
                        >
                            <Sparkles size={16} className="mr-2" />
                            {isLoading ? "Extricating Knowledge..." : "Generate Analysis"}
                            <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform ml-2" />
                        </button>
                    </motion.form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12 p-4 border border-red-500/20 bg-red-500/5 rounded-lg text-[13px] text-red-500 font-mono flex items-center justify-center gap-3 max-w-[400px] mx-auto"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </motion.div>
                    )}

                    {(isLoading || data) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 32 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex items-stretch mx-auto w-full max-w-[840px] text-left mt-12"
                        >
                            <div className="w-full relative feedback-paper rounded-3xl overflow-hidden flex flex-col min-h-full">
                                <div className="flex-1 overflow-auto bg-[var(--bg)] custom-scrollbar relative">
                                    <AnimatePresence mode="wait">
                                        {isLoading ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="inset-0 flex flex-col items-center justify-center p-12 gap-6 text-center min-h-[400px]"
                                            >
                                                <div className="relative">
                                                    <div className="w-12 h-12 border-[2px] border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                                                        Distilling transcript
                                                    </span>
                                                    <p className="text-[13px] text-[var(--text-muted)] italic font-serif">
                                                        {outputLanguage === "hindi" ? "ज्ञान निकाला जा रहा है..." :
                                                            outputLanguage === "hinglish" ? "Knowledge extract ho raha hai..." :
                                                                "Extracting the core essence..."}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ) : data ? (
                                            <motion.div
                                                key="notes"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="p-8 sm:p-12 md:p-16 lg:p-20"
                                            >
                                                {/* Mobile Actions */}
                                                <div className="sm:hidden flex justify-end gap-4 mb-8">
                                                    <button onClick={handleCopy} className="text-[10px] font-mono uppercase text-[var(--text-faint)]">[{copied ? "Copied" : "Copy"}]</button>
                                                    <button onClick={handleDownload} className="text-[10px] font-mono uppercase text-[var(--text-faint)]">[Download]</button>
                                                </div>

                                                <header className="mb-16 pb-12">
                                                    <h2 className="text-[28px] sm:text-[36px] lg:text-[44px] font-bold text-[var(--text-primary)] leading-[1.15] tracking-[-0.03em] mb-8 font-serif italic">
                                                        {("metadata" in data && data.metadata?.title) || "Generated Notes"}
                                                    </h2>
                                                    <div className="grid grid-cols-2 gap-8">
                                                        <div className="space-y-1">
                                                            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-faint)]">Source</span>
                                                            <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">
                                                                {("metadata" in data && data.metadata?.channel) || "YouTube Content"}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-faint)]">Length</span>
                                                            <p className="text-[14px] font-medium text-[var(--text-primary)]">
                                                                {("metadata" in data && data.metadata?.duration) || "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </header>

                                                <div className="space-y-12">
                                                    {"blocks" in data &&
                                                        data.blocks?.map((block, i) => (
                                                            <NoteBlock key={i} block={block} />
                                                        ))}
                                                </div>

                                                <footer className="mt-20 pt-8 border-t border-[var(--border)] flex items-center justify-between">
                                                    <span className="text-[11px] font-mono text-[var(--text-faint)]">SYNCED_VIA_SYNAPSE_API</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--mac-green)]" />
                                                        <span className="text-[11px] font-mono text-[var(--text-faint)]">Finalized</span>
                                                    </div>
                                                </footer>
                                            </motion.div>
                                        ) : null}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </section>
            </div>
        </main>
    );
}

function NoteBlock({ block }: { block: any }) {
    const { resolvedTheme } = useTheme();
    const [codeCopied, setCodeCopied] = useState(false);

    const handleCodeCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    switch (block.type) {
        case "heading":
            return (
                <div className="group pt-10 pb-4">
                    <h3 className="font-serif italic text-[24px] sm:text-[28px] font-medium text-[var(--text-primary)] tracking-tight leading-tight">
                        {block.content}
                    </h3>

                </div>
            );
        case "paragraph":
            return (
                <p className="text-[16px] sm:text-[17px] font-normal leading-[1.8] text-[var(--text-muted)] mb-8">
                    {block.content}
                </p>
            );
        case "bullet":
            return (
                <ul className="space-y-4 mb-10 pl-1">
                    {block.items.map((item: string, i: number) => (
                        <li key={i} className="flex gap-4 items-start">
                            <div className="mt-1.5 text-[var(--accent)] shrink-0">
                                <Check size={14} strokeWidth={3} />
                            </div>
                            <span className="text-[15px] sm:text-[16px] text-[var(--text-primary)] leading-relaxed">{item}</span>
                        </li>
                    ))}
                </ul>
            );
        case "code":
            return (
                <div className="my-10 rounded-xl overflow-hidden border-[1.5px] border-[var(--border)] shadow-[var(--shadow-sm)]">
                    {/* Notion-style header bar */}
                    <div className="flex justify-between items-center px-5 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border)]">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--text-faint)] opacity-40" />
                            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
                                {block.language || "code"}
                            </span>
                        </div>
                        <button
                            onClick={() => handleCodeCopy(block.content)}
                            className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            {codeCopied ? <Check size={12} /> : <Copy size={12} />}
                            {codeCopied ? "Copied" : "Copy Source"}
                        </button>
                    </div>
                    <SyntaxHighlighter
                        language={block.language || "text"}
                        style={resolvedTheme === "dark" ? oneDark : oneLight}
                        customStyle={{
                            margin: 0,
                            padding: "1.5rem",
                            fontSize: "13.5px",
                            lineHeight: "1.7",
                            background: "var(--bg)",
                            borderRadius: 0,
                        }}
                        showLineNumbers
                        lineNumberStyle={{
                            minWidth: "2.5em",
                            paddingRight: "1.5em",
                            color: "var(--text-faint)",
                            fontSize: "11px",
                            opacity: 0.5,
                        }}
                    >
                        {block.content}
                    </SyntaxHighlighter>
                </div>
            );
        case "timestamp":
            return (
                <div className="flex gap-4 items-center my-8 group cursor-pointer w-fit">
                    <span className="font-mono text-[11px] font-bold text-[var(--bg)] bg-[var(--text-primary)] px-2.5 py-1 rounded-[4px] shadow-[3px_3px_0_0_var(--accent)] group-hover:shadow-[1px_1px_0_0_var(--accent)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-all">
                        {block.time}
                    </span>
                    <span className="text-[15px] font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors italic font-serif">
                        {block.topic}
                    </span>
                </div>
            );
        default:
            return null;
    }
}
