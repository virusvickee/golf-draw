"use client";

import { motion } from "framer-motion";
import CountUpLib from "react-countup";
import { useEffect, useState } from "react";

export function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScrollReveal({ children, delay = 0, className }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({ end, prefix = "", suffix = "" }: { end: number, prefix?: string, suffix?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return <span>{prefix}{end}{suffix}</span>;
  
  return <CountUpLib end={end} prefix={prefix} suffix={suffix} duration={2.5} separator="," />;
}

export function DrawVisual() {
  const numbers = [12, 34, 7, 28, 41];
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      {numbers.map((num, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 10,
            delay: i * 0.15
          }}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-black text-2xl md:text-3xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] border-2 border-emerald-300"
        >
          {num}
        </motion.div>
      ))}
    </div>
  );
}

const HomeAnimations = { FadeIn, ScrollReveal, CountUp, DrawVisual };
export default HomeAnimations;
