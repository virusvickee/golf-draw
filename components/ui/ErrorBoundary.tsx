"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-slate-400 mb-8 max-w-md">
        We encountered an unexpected error while loading this page. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="primary">
          Try again
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="secondary">
          Go Home
        </Button>
      </div>
    </div>
  );
}
