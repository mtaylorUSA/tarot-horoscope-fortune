// src/app/api/reading/route.js
// ═══════════════════════════════════════════════════════════════
// API ROUTE: /api/reading
// Accepts POST with { sign, cards }
// Calls OpenAI to generate a tailored horoscope + fortune
// Returns { horoscope, fortune }
//
// 2026-04-16 UPDATE: Fortune prompt rewritten for classic
// fortune-cookie style — exactly 1 sentence, plain English,
// grounded in cards + zodiac but never naming them.
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

2. FORTUNE: A classic fortune-cookie-style message. Follow these rules strictly:
   - EXACTLY ONE sentence. No more, no less.
   - 8 to 20 words.
   - Ends with a period (not "!" and not "?").
   - Use plain, everyday English — the voice of a real fortune cookie slip.
   - Tone: calm, gently optimistic, universal, slightly knowing.
   - Shape the fortune around the overall feeling of the three cards and the sign's energy, but NEVER name the cards, suits, zodiac sign, planets, or elements.
   - Do NOT use mystical, medieval, or poetic language — that belongs in the horoscope.
   - Do NOT use hedging words like "maybe," "perhaps," or "might."
   - Do NOT use emoji, quotation marks, or exclamation points.

   Good examples of the style you should match:
   - A pleasant surprise is waiting for you just around the corner.
   - The quiet work you are doing now will pay off sooner than expected.
   - A small act of kindness this week will return to you threefold.
   - Trust the path you have chosen, even where it bends out of sight.
   - Good news will arrive from someone you have not heard from in a while.

   Bad examples (do NOT write like these):
   - "The Tower shakes your foundations, brave Leo!" (names cards and sign, wrong tone)
   - "Mystical winds of fate shall carry thee forward." (medieval voice)
   - "Maybe something good might happen soon." (hedging, vague)
   - "Great things ahead!!" (not a full sentence, uses "!")

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
        max_tokens: 300,
        temperature: 0.8,
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
