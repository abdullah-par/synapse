"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-8 rounded-2xl border border-border bg-surface hover:bg-background transition-all duration-300 group"
        >
            <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-text-muted leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}
