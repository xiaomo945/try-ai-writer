"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  plan: string;
  currency: "usd" | "cny";
  label: string;
  variant: "primary" | "outline";
}

export default function CheckoutButton({ plan, currency, label, variant }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, currency }),
      });

      if (!response.ok) {
        throw new Error("Checkout failed");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const btnClass = variant === "primary" ? "btn-primary w-full" : "btn-outline w-full";

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={btnClass}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </span>
      ) : (
        label
      )}
    </button>
  );
}