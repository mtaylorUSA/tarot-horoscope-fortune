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
//
// 2026-04-25 UPDATE: Horoscope prompt rewritten for casual-but-
// mystical voice with horoscope-style framing (NOT a tarot-card
// walkthrough). User feedback indicated previous "mystical,
// poetic" output read as stilted and inaccessible. New prompt:
//   - Leads with horoscope-style opener (sign + element + planet)
//   - References cards evocatively, not mechanically (no "in
//     your past / present / future")
//   - Closer formula: "Listen for..." / "Notice where..." /
//     "Watch for..." / "Pay attention when..."
//   - Stays abstract — no naming life areas (work, money, etc.)
//   - Banned-word list + 3 good examples + 6 bad examples
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

    const prompt = `You are a tarot reader and astrologer who writes for ordinary readers — warm, grounded, a little wise. You are NOT a Renaissance Faire performer. A user with the zodiac sign ${sign.name} (${sign.symbol}, ${sign.element} sign ruled by ${sign.rulingPlanet}) has drawn these three tarot cards for today:

${cardList}

Write two things:

1. HOROSCOPE: A personalized horoscope for ${sign.name} today. Follow these rules strictly:

STRUCTURE — 4 to 5 sentences, in this exact order:
   - Sentence 1 — Horoscope opener: Name ${sign.name} and observe today's energy. Reference either the element (${sign.element}), the ruling planet (${sign.rulingPlanet}), or both. Set the day's tone before any card is named.
   - Sentence 2 — First card (past influence): Name the card and describe its meaning in plain English. Use a phrase that implies "from earlier" without ever writing "in your past."
   - Sentence 3 — Second card (present influence): Name the card and describe its meaning. Use a phrase that implies "right now" without ever writing "in your present."
   - Sentence 4 — Third card (future influence): Name the card and describe its meaning. Use a phrase that implies "ahead / closing in" without ever writing "in your future."
   - Sentence 5 — Optional closer: One short forward-looking line. Pick ONE of: "Listen for…", "Notice where…", "Watch for…", or "Pay attention when…" — vary the choice; do not default to the same one every time.

POSITION LANGUAGE — never write "in your past," "in your present," or "in your future." Use evocative cues instead.
   - Past card: "surfaces from earlier in your story," "echoes from earlier," "lingers from before," "carries an old story forward."
   - Present card: "colors the middle of your day," "shapes your current hours," "sits with you now," "is the figure at the center today."
   - Future card: "waits at the day's edge," "waits ahead," "is on its way," "is closing in."

VOICE:
   - Plain everyday English. Write like a wise friend who reads tarot — not a Renaissance Faire performer.
   - Address the reader as "you" directly.
   - Warm, grounded, gently mystical. Never preachy, theatrical, or self-help-y.
   - One metaphor per sentence. No stacking images.
   - Stay abstract. Do NOT name specific life areas (work, career, money, relationships, health, communication, family). The reader will apply the message to their own life.

LENGTH:
   - Most sentences 18 to 25 words. Vary the lengths.
   - Hard ceiling: never exceed 28 words in any sentence.
   - Short closers (under 15 words) are fine.

BANNED VOCABULARY (do NOT use): thou, shall, behold, doth, thee, thy, essence, precipice, contemplation, aspirations, embrace (as noun), whispers, sacred, currents of, unveiling, "trust your gut," "in your past," "in your present," "in your future."

NO exclamation points.

GOOD EXAMPLES (match this style exactly):

Example 1 — Scorpio (Past: The Fool | Present: The High Priestess | Future: Death):
"Scorpio, today's energy pulls you inward — fitting, given your water-sign nature and Pluto's quiet influence. The Fool surfaces from earlier in your story, a reminder that you've taken leaps before without knowing where they'd land. The High Priestess colors the middle of your day, favoring an answer you've already sensed but kept waiting on. Death waits at the day's edge — not as a threat, but as a door closing softly so a new chapter can open. Listen for what wants to begin."

Example 2 — Leo (Past: Three of Cups | Present: Knight of Pentacles | Future: The Sun):
"Leo, the day favors momentum, which suits you — a fire sign ruled by the Sun rarely needs convincing to start. The Three of Cups echoes from earlier — the people who've genuinely been in your corner, the easy company you sometimes take for granted. The Knight of Pentacles shapes your current hours; he asks for patience, the steady kind of work that doesn't ask to be applauded. The Sun waits ahead, your own ruling light, and the warmth you've been building finally shows in full. Notice where the steady effort starts to pay off."

Example 3 — Aquarius (Past: The Empress | Present: Two of Swords | Future: Ten of Pentacles):
"Aquarius, today asks something quieter than your usual current — your air-sign instinct is to keep moving, but the day rewards stillness instead. The Empress lingers from before, a reminder of the abundance and care you've been growing whether you've noticed or not. The Two of Swords sits with you now; it marks a choice you've been holding at arm's length, weighing it without committing. The Ten of Pentacles waits ahead — a long-term picture, the kind built one steady decision at a time. Watch for the moment your hesitation lifts."

BAD EXAMPLES (do NOT write like these):
   - "Today, Scorpio, you stand at the precipice of inner exploration, guided by the essence of the Fool's daring spirit." (formal vocabulary, theatrical — exactly what we replaced)
   - "The Fool in your past was a leap of faith." (mechanical position naming — banned)
   - "The cards whisper ancient truths unto thee, brave one." (medieval voice — banned)
   - "Allow the currents of your emotions to flow." (stacked metaphors, formal phrasing)
   - "Trust your gut on this one — your work life is about to shift." (too informal, names a life area)
   - "The High Priestess in your present urges you to listen." (mechanical position naming + boring verb)

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
        max_tokens: 400,
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

    const horoscope = horoscopeMatch?.[1]?.trim() || "The stars are still working on your reading. Please try again.";
    const fortune = fortuneMatch?.[1]?.trim() || "The oracle is still gathering its wisdom. Please try again.";

    return NextResponse.json({ horoscope, fortune });

  } catch (err) {
    console.error("Reading route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
