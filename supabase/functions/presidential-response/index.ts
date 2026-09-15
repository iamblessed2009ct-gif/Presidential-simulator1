const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

// The game uses Google's Gemini Developer API. Gemini currently offers a
// free tier for eligible models, so the simulator can run without an
// OpenAI subscription. Keep the API key server-side in Supabase secrets.
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-3.7-flash";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: "AI service is not configured. Add GEMINI_API_KEY to the Supabase Edge Function secrets.",
      }), {
        status: 503,
        headers: jsonHeaders,
      });
    }

    const body = await req.json();
    if (typeof body?.systemPrompt !== "string" || typeof body?.userPrompt !== "string") {
      return new Response(JSON.stringify({ error: "Invalid request." }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const isProposal = body.mode === "proposal";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: body.systemPrompt }],
        },
        contents: [{
          role: "user",
          parts: [{ text: body.userPrompt }],
        }],
        generationConfig: {
          temperature: isProposal ? 0.85 : 0.9,
          maxOutputTokens: isProposal ? 5000 : 700,
          ...(isProposal ? { responseMimeType: "application/json" } : {}),
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Gemini request failed:", response.status, detail);
      return new Response(JSON.stringify({ error: "AI service request failed." }), {
        status: 502,
        headers: jsonHeaders,
      });
    }

    const result = await response.json();
    const content = result?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part?.text || "")
      .join("")
      .trim();

    if (!content) {
      return new Response(JSON.stringify({ error: "AI returned an empty response." }), {
        status: 502,
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify({
      content,
      provider: "Google Gemini",
      model: GEMINI_MODEL,
    }), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (error) {
    console.error("Presidential AI error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate a response." }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
