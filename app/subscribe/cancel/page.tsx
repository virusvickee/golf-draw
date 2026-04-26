import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function SubscribeCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-10 pb-8 px-8">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center">
              <XCircle className="h-10 w-10 text-slate-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Checkout Cancelled</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            No worries! You can always come back and complete your subscription when you&apos;re ready.
          </p>
          <Link href="/subscribe" passHref legacyBehavior>
            <Button className="w-full" size="lg">Try Again</Button>
          </Link>
          <div className="mt-4">
            <Link href="/dashboard" passHref legacyBehavior>
              <Button variant="ghost" className="w-full">Return to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
