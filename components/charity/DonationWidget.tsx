"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface DonationWidgetProps {
  charity: {
    id: string;
    name: string;
  };
}

export function DonationWidget({ charity }: DonationWidgetProps) {
  const [donating, setDonating] = React.useState(false);
  const [amount, setAmount] = React.useState(10);
  const [customAmount, setCustomAmount] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const handleDonate = async () => {
    setDonating(true);
    try {
      const finalAmount = customAmount ? Number(customAmount) : amount;

      if (!finalAmount || finalAmount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          charity_id: charity.id,
          amount: finalAmount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success("Thank you for your donation! 🎉");
      } else {
        toast.error(data.error || "Donation failed. Try again.");
      }
    } catch (error) {
      console.error("Donation error:", error);
      toast.error("Something went wrong");
    } finally {
      setDonating(false);
    }
  };

  return (
    <section className="mt-8 bg-slate-900 rounded-2xl p-8 border border-slate-800">
      <h2 className="text-2xl font-bold text-white mb-2">❤️ Make a Donation</h2>
      <p className="text-slate-400 mb-6">
        Support {charity.name} directly — independent of your subscription.
      </p>

      {success ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-emerald-400">Thank You!</h3>
          <p className="text-slate-400 mt-2">Your donation makes a real difference.</p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 text-emerald-400 underline text-sm hover:text-emerald-300"
          >
            Donate Again
          </button>
        </div>
      ) : (
        <>
          {/* Quick amount buttons */}
          <div className="flex gap-3 mb-4 flex-wrap">
            {[5, 10, 20, 50].map((val) => (
              <button
                key={val}
                onClick={() => {
                  setAmount(val);
                  setCustomAmount("");
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  amount === val && !customAmount
                    ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                £{val}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="mb-6">
            <input
              type="number"
              placeholder="Custom amount (£)"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount(0);
              }}
              min="1"
              className="bg-slate-800 text-white rounded-xl px-4 py-3 w-full border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Donate button */}
          <Button
            onClick={handleDonate}
            disabled={donating || (!amount && !customAmount)}
            className="w-full text-lg py-6"
            isLoading={donating}
          >
            Donate £{customAmount || amount} to {charity.name}
          </Button>

          <p className="text-slate-500 text-xs text-center mt-4">
            🔒 Secure donation — not tied to your subscription
          </p>
        </>
      )}
    </section>
  );
}
