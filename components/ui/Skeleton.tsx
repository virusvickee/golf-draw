import * as React from "react";

export function Skeleton({ 
  className = '',
  style
}: { 
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div 
      className={`animate-pulse bg-slate-700/50 rounded-lg ${className}`} 
      style={style}
    />
  );
}
