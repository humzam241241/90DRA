import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      console.error("OPENAI_API_KEY not set in Supabase secrets");
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { prompt, response_json_schema } = body;
    console.log("Received request, prompt length:", prompt?.length);

    const wantsJson = !!response_json_schema;
    const messages = [
      {
        role: "system",
        content: wantsJson
          ? "You are a helpful assistant. Always respond with valid JSON matching the requested schema."
          : "You are a helpful assistant.",
      },
      { role: "user", content: prompt },
    ];

    const openaiBody: Record<string, unknown> = {
      model: "gpt-4o-mini",
      messages,
    };
    if (wantsJson) {
      openaiBody.response_format = { type: "json_object" };
    }

    console.log("Calling OpenAI...");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify(openaiBody),
    });

    const responseText = await response.text();
    console.log("OpenAI status:", response.status);

    if (!response.ok) {
      console.error("OpenAI error body:", responseText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error (${response.status}): ${responseText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(responseText);
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in OpenAI response:", result);
      return new Response(
        JSON.stringify({ error: "Empty response from OpenAI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Success, returning content");

    // If JSON was requested, parse it; otherwise return as text wrapped in object
    const payload = wantsJson ? JSON.parse(content) : { text: content };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function error:", err.message, err.stack);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
