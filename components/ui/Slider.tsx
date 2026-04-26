"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  onValueChange: (value: number) => void;
}

export function Slider({ className, label, value, min = 10, max = 100, onValueChange, ...props }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <div className="flex items-center justify-between">
        {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
        <span className="text-sm font-bold text-emerald-400">{value}%</span>
      </div>
      <div className="relative flex items-center w-full h-5 touch-none">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          {...props}
        />
        {/* Track */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          {/* Fill */}
          <div
            className="h-full bg-emerald-500 transition-all duration-150 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Thumb */}
        <div
          className="absolute h-5 w-5 bg-white border-2 border-emerald-500 rounded-full shadow-md transition-transform"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    </div>
  );
}
