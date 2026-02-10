import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DepositModal({ open, onClose, username }) {
  const [amount, setAmount] = useState("");

  if (!open) return null;

  const startPayment = async () => {
    const res = await fetch("/api/payu/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        amount,
      }),
    });

    const data = await res.json();

    // redirect to PayU
    const form = document.createElement("form");
    form.method = "POST";
    form.action = data.action;

    Object.entries(data.fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.name = key;
      input.value = value as string;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-xl w-80 space-y-4">
        <h2 className="text-lg font-semibold">Deposit</h2>

        <div className="text-sm">
          Username
          <input
            disabled
            value={username}
            className="w-full mt-1 p-2 rounded bg-muted"
          />
        </div>

        <div className="text-sm">
          Amount
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-muted"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={startPayment} className="flex-1">
            Pay Now
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
