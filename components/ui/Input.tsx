"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, success, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-lg bg-slate-800/50 border px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900",
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
              : success
              ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500"
              : "border-slate-700 focus:border-emerald-500 focus:ring-emerald-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        {error && <span className="text-sm text-red-400 mt-0.5">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
