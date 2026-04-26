import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function SubscribeSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--gradient-hero)" }}>
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-10 pb-8 px-8">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Thank You!</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Your subscription has been successfully activated. You are now ready to track scores, enter draws, and support your charity.
          </p>
          <Link href="/dashboard" passHref legacyBehavior>
            <Button className="w-full" size="lg">Go to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
