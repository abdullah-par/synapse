"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { ArrowRight, Zap, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: "/how-it-works", label: "How it Works" },
        { href: "/#features", label: "Features" },
        { href: "/philosophy", label: "Philosophy" },
    ];

    return (
        <>
            <nav
                className={`sticky top-0 z-50 transition-all duration-300 glass-nav ${isScrolled ? "border-b border-[var(--border)] shadow-[0_1px_20px_rgba(0,0,0,0.05)]" : "border-b border-transparent"
                    }`}
            >
                <div className="page-shell h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[4px] border-[2px] border-[var(--text-primary)] bg-[var(--bg)] shadow-[3px_3px_0_0_var(--text-primary)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1.5px_1.5px_0_0_var(--text-primary)] transition-all">
                            <span
                                className="font-serif font-black text-[22px] leading-none mb-[2px]"
                                style={{ fontFamily: "var(--font-serif)" }}
                            >
                                S
                            </span>
                        </div>
                        <span className="font-bold text-[18px] tracking-[-0.04em] text-[var(--text-primary)]">
                            Synapse
                        </span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-[12px] font-mono uppercase tracking-wide font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link
                            href="/generate"
                            className="hidden md:inline-flex btn-primary text-[13px] py-2 px-4 rounded-[10px]"
                        >
                            Try for Free <ArrowRight size={13} strokeWidth={2.5} />
                        </Link>
                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="fixed top-16 left-0 right-0 z-40 glass-nav border-b border-[var(--border)] overflow-hidden"
                    >
                        <div className="page-shell py-4 flex flex-col gap-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-[13px] font-mono uppercase tracking-wide font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] py-2 transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link href="/generate" className="btn-primary text-[14px] mt-2 justify-center">
                                Try for Free <ArrowRight size={14} />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
