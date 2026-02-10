import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { doc, setDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { submitPaymentForm, parsePaymentResponse } from "sabpaisa-pg-dev";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
}

export function DepositModal({ open, onClose, username }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const startPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "sabpaisa-create-payment",
        {
          body: { username, amount },
        }
      );

      if (fnError) throw new Error(fnError.message);
      if (data.error) throw new Error(data.error);

      // Store payment info for callback handling
      sessionStorage.setItem("sabpaisa_payment", JSON.stringify({
        username,
        amount,
        clientTxnId: data.clientTxnId,
      }));

      // Submit payment form - this redirects to SabPaisa
      await submitPaymentForm({
        clientCode: data.clientCode,
        transUserName: data.transUserName,
        transUserPassword: data.transUserPassword,
        authKey: data.authKey,
        authIV: data.authIV,
        callbackUrl: window.location.origin + "/?payment=callback",
        payerName: username,
        payerEmail: "",
        payerMobile: "",
        amount: String(amount),
        clientTxnId: data.clientTxnId,
        channelId: "npm",
        env: "stag",
        udf1: "", udf2: "", udf3: "", udf4: "", udf5: "",
        udf6: "", udf7: "", udf8: "", udf9: "", udf10: "",
        udf11: "", udf12: "", udf13: "", udf14: "", udf15: "",
        udf16: "", udf17: "", udf18: "", udf19: "", udf20: "",
        payerVpa: "", modeTransfer: "", byPassFlag: "",
        cardHolderName: "", pan: "", cardExpMonth: "",
        cardExpYear: "", cardType: "", cvv: "", browserDetails: "",
        bankId: "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to initialize payment");
      setLoading(false);
    }
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
          Amount (₹)
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full mt-1 p-2 rounded bg-muted"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button onClick={startPayment} className="flex-1" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pay Now"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
