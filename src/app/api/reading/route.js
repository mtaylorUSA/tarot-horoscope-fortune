// src/app/api/reading/route.js
// ═══════════════════════════════════════════════════════════════
// API ROUTE: /api/reading
// Accepts POST with { sign, cards }
// Calls OpenAI to generate a tailored horoscope + fortune
// Returns { horoscope, fortune }
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // ── Parse request body ──
    const { sign, cards } = await request.json();

    if (!sign || !cards || cards.length !== 3) {
      return NextResponse.json(
        { error: "Missing sign or cards" },
        { status: 400 }
      );
    }

    // ── Build the prompt ──
    const cardList = cards
      .map((c, i) => {
        const positions = ["Past", "Present", "Future"];
        return `${positions[i]}: ${c.name} (${c.keywords.join(", ")})`;
      })
      .join("\n");

    const prompt = `You are a mystical tarot reader and astrologer. A user with the zodiac sign ${sign.name} (${sign.symbol}, ${sign.element} sign ruled by ${sign.rulingPlanet}) has drawn these three tarot cards for today:

${cardList}

Write two things:

1. HOROSCOPE: A personalized horoscope for ${sign.name} today (3-4 sentences). Weave together the energy of their zodiac sign with the messages from their three tarot cards. Use mystical, poetic language. Be specific to the cards drawn. Do not use generic horoscope language.

2. FORTUNE: A single fortune cookie-style message (1-2 sentences maximum) inspired by the overall reading. Make it memorable, slightly mysterious, and uplifting.

Respond in this exact format:
HOROSCOPE: [horoscope text here]
FORTUNE: [fortune text here]`;

    // ── Call OpenAI ──
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.85,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI error:", errText);
      return NextResponse.json(
        { error: "OpenAI request failed" },
        { status: 500 }
      );
    }

    const openaiData = await openaiResponse.json();
    const rawText = openaiData.choices?.[0]?.message?.content || "";

    // ── Parse the response ──
    const horoscopeMatch = rawText.match(/HOROSCOPE:\s*([\s\S]*?)(?=FORTUNE:|$)/i);
    const fortuneMatch = rawText.match(/FORTUNE:\s*([\s\S]*?)$/i);

    const horoscope = horoscopeMatch?.[1]?.trim() || "The stars are contemplating your path. Please try again.";
    const fortune = fortuneMatch?.[1]?.trim() || "The oracle is gathering its wisdom. Please try again.";

    return NextResponse.json({ horoscope, fortune });

  } catch (err) {
    console.error("Reading route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
