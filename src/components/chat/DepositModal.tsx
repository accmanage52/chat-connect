import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { doc, setDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Dynamically import sabpaisa-pg-dev
import PaymentForm from "sabpaisa-pg-dev";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
}

interface PaymentConfig {
  clientCode: string;
  transUserName: string;
  transUserPassword: string;
  authKey: string;
  authIV: string;
  clientTxnId: string;
  amount: string;
  payerName: string;
}

export function DepositModal({ open, onClose, username }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
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

      setPaymentConfig(data);
    } catch (err: any) {
      setError(err.message || "Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentResponse = async (response: any) => {
    console.log("SabPaisa Response:", response);

    if (response.status === "SUCCESS") {
      try {
        // Ensure chat doc exists
        const chatDocRef = doc(db, "chats", username);
        await setDoc(chatDocRef, { clientUsername: username, updatedAt: Timestamp.now() }, { merge: true });

        // Insert payment message
        const messagesRef = collection(db, "chats", username, "messages");
        await addDoc(messagesRef, {
          text: JSON.stringify({
            type: "payment",
            amount: response.amount || amount,
            clientTxnId: paymentConfig?.clientTxnId || "",
            bankTxnId: response.bankTxnId || response.sabpaisaTxnId || "",
            paymentMode: response.paymentMode || "",
            status: response.status,
          }),
          type: "payment",
          user: username,
          createdAt: Timestamp.now(),
          seenBy: [username],
        });
      } catch (err) {
        console.error("Failed to save payment message:", err);
      }
    }

    // Reset and close
    setPaymentConfig(null);
    setAmount("");
    onClose();
  };

  // If payment config is ready, show SabPaisa form
  if (paymentConfig) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card p-4 rounded-xl w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <PaymentForm
            clientCode={paymentConfig.clientCode}
            transUserName={paymentConfig.transUserName}
            transUserPassword={paymentConfig.transUserPassword}
            authKey={paymentConfig.authKey}
            authIV={paymentConfig.authIV}
            payerName={paymentConfig.payerName}
            payerEmail=""
            payerMobile=""
            amount={paymentConfig.amount}
            clientTxnId={paymentConfig.clientTxnId}
            channelId="npm"
            callbackUrl=""
            url="https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1"
            udf1="" udf2="" udf3="" udf4="" udf5=""
            udf6="" udf7="" udf8="" udf9="" udf10=""
            udf11="" udf12="" udf13="" udf14="" udf15=""
            udf16="" udf17="" udf18="" udf19="" udf20=""
            payerVpa="" modeTransfer="" byPassFlag=""
            cardHolderName="" pan="" cardExpMonth=""
            cardExpYear="" cardType="" cvv="" browserDetails=""
            bankId=""
            callbackFunction={handlePaymentResponse}
            env="stag"
          />
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={() => {
              setPaymentConfig(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

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
