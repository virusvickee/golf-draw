"use client";

import Link from "next/link";
import * as React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-hero)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-black tracking-tight">
            <span className="text-gradient-green">Golf</span>
            <span className="text-white">Draw</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
