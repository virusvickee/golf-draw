import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="text-9xl font-black text-slate-800 mb-8">404</div>
      <h2 className="text-3xl font-bold text-white mb-4">Looks like this hole doesn't exist</h2>
      <p className="text-slate-400 mb-8 max-w-md">
        The page you are looking for has been moved, deleted, or possibly never existed. Let's get you back on the fairway.
      </p>
      <Link href="/">
        <Button size="lg">Back to Home</Button>
      </Link>
    </div>
  );
}
