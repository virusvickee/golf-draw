import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  variant?: "inline" | "full-page" | "card";
}

export function LoadingSpinner({ className, variant = "inline" }: LoadingSpinnerProps) {
  const icon = <Loader2 className={cn("animate-spin text-emerald-500", className)} />;

  if (variant === "full-page") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <Loader2 className={cn("animate-spin text-emerald-500 h-10 w-10", className)} />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="flex items-center justify-center p-8 w-full h-full">
        <Loader2 className={cn("animate-spin text-emerald-500 h-8 w-8", className)} />
      </div>
    );
  }

  return icon;
}
