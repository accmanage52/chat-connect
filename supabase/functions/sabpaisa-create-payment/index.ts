import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, amount } = await req.json();

    if (!username || !amount) {
      return new Response(
        JSON.stringify({ error: "username and amount are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientCode = Deno.env.get("SABPAISA_CLIENT_CODE");
    const transUserName = Deno.env.get("SABPAISA_TRANS_USERNAME");
    const transUserPassword = Deno.env.get("SABPAISA_TRANS_PASSWORD");
    const authKey = Deno.env.get("SABPAISA_AUTH_KEY");
    const authIV = Deno.env.get("SABPAISA_AUTH_IV");

    if (!clientCode || !transUserName || !transUserPassword || !authKey || !authIV) {
      return new Response(
        JSON.stringify({ error: "SabPaisa credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique transaction ID
    const clientTxnId = `TXN_${username}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return new Response(
      JSON.stringify({
        clientCode,
        transUserName,
        transUserPassword,
        authKey,
        authIV,
        clientTxnId,
        amount: String(amount),
        payerName: username,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
