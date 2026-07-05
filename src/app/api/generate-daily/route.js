// src/app/api/generate-daily/route.js
// ═══════════════════════════════════════════════════════════════
// API ROUTE: /api/generate-daily
// Purpose: Daily cron job. Generates 12 GENERIC daily horoscopes
//          (one per zodiac sign) and STORES them in the PocketBase
//          `horoscopes` collection so /api/reading can reuse them.
// Trigger: Vercel Cron, once per day (runs in UTC).
// AI Calls: up to 12 per run (skipped for any sign already stored today).
//
// 2026-07-04: Implemented storage (was a stub before).
//   - Reads signs from src/data/zodiac-signs.json
//   - Writes via getAdminPocketBase() (superuser) from src/lib/pocketbase.js
//   - Generic (card-free) prompt that PRESERVES the Version D voice rules
//     used by /api/reading. Same VOICE / LENGTH / BANNED blocks; only the
//     card-position STRUCTURE is dropped, since a daily horoscope has no
//     drawn cards.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { getAdminPocketBase } from '@/lib/pocketbase';
import zodiacSigns from '@/data/zodiac-signs.json';

// Node runtime (PocketBase SDK + server-only env vars). Never cache this route.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// 12 AI calls take a while; ask Vercel to allow up to 60 seconds.
export const maxDuration = 60;

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Format a Date as PocketBase's datetime string: "YYYY-MM-DD HH:mm:ss.SSSZ"
function toPbDate(d) {
  return d.toISOString().replace('T', ' ');
}

// Today's UTC day as { value, dayStart, dayEnd }.
// value / dayStart = midnight today (UTC); dayEnd = midnight tomorrow (UTC).
// The reading API must use this SAME day definition so its lookups match.
function getUtcDay() {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const nextDay = new Date(start);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  return {
    value: toPbDate(start),
    dayStart: toPbDate(start),
    dayEnd: toPbDate(nextDay),
  };
}

// Build the GENERIC daily-horoscope prompt for one sign.
// Version D voice preserved from /api/reading — only the card structure removed.
function buildPrompt(sign) {
  return `You are a tarot reader and astrologer who writes for ordinary readers — warm, grounded, a little wise. You are NOT a Renaissance Faire performer. Write today's general daily horoscope for everyone born under the zodiac sign ${sign.name} (${sign.symbol}, ${sign.element} sign ruled by ${sign.rulingPlanet}).

Follow these rules strictly:

STRUCTURE — 3 to 4 sentences:
   - Sentence 1 — Horoscope opener: Name ${sign.name} and observe today's energy. Reference either the element (${sign.element}), the ruling planet (${sign.rulingPlanet}), or both. Set the day's tone.
   - Middle sentences — Develop the day's mood or a gentle invitation. Keep it GENERAL: this is one horoscope for everyone born under ${sign.name}, not a personal reading, so there are no tarot cards to reference.
   - Final sentence — Optional closer: one short forward-looking line. Pick ONE of: "Listen for…", "Notice where…", "Watch for…", or "Pay attention when…" — vary the choice; do not default to the same one every time.

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

BANNED VOCABULARY (do NOT use): thou, shall, behold, doth, thee, thy, essence, precipice, contemplation, aspirations, embrace (as noun), whispers, sacred, currents of, unveiling, "trust your gut."

NO exclamation points.

GOOD EXAMPLES (match this style — note a daily horoscope has NO tarot cards):

Example 1 — Taurus:
"Taurus, the day rewards a slower pace, which suits you — an earth sign under Venus rarely needs to rush to feel sure of itself. There is a steadiness available now, the kind that comes from trusting what you already know rather than chasing something new. Old ground can feel surprisingly fertile if you stop long enough to notice it. Watch for the small comfort that turns out to matter more than you expected."

Example 2 — Gemini:
"Gemini, your thoughts move quickly today, fitting for an air sign guided by Mercury, though the day favors landing on one idea over collecting ten. A quieter kind of clarity is within reach if you let the noise settle instead of adding to it. What felt scattered this morning may gather into something clearer by afternoon. Notice where a single clear choice feels lighter than keeping every option open."

Respond with ONLY the horoscope text. No labels, no "HOROSCOPE:" prefix, no quotation marks, no preamble.`;
}

// Call OpenAI and return the horoscope text (or throw).
async function generateHoroscope(sign) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: buildPrompt(sign) }],
      max_tokens: 300,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('OpenAI returned empty content');
  }
  return text;
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET(request) {
  // Optional cron protection: enforced ONLY if CRON_SECRET is set in env.
  // (Leaving CRON_SECRET unset keeps manual/browser testing easy for now.)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️ Unauthorized: /api/generate-daily called without a valid CRON_SECRET');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const day = getUtcDay();
  console.log(`📅 generate-daily starting for UTC day: ${day.value}`);

  // Authenticate once as the superuser (write access).
  let pb;
  try {
    pb = await getAdminPocketBase();
    console.log('🔐 Authenticated as PocketBase superuser');
  } catch (err) {
    console.error('❌ PocketBase superuser login failed:', err?.message || err);
    return NextResponse.json(
      { error: 'PocketBase authentication failed' },
      { status: 500 }
    );
  }

  const results = [];
  let saved = 0;
  let skipped = 0;
  let failed = 0;

  for (const sign of zodiacSigns) {
    try {
      // 1) Skip if today's horoscope for this sign already exists (saves an AI call).
      let exists = false;
      try {
        await pb
          .collection('horoscopes')
          .getFirstListItem(
            `sign = "${sign.id}" && date >= "${day.dayStart}" && date < "${day.dayEnd}"`
          );
        exists = true;
      } catch (err) {
        // 404 = nothing found = fine, we should generate. Anything else is a real error.
        if (err?.status !== 404) throw err;
      }

      if (exists) {
        skipped++;
        console.log(`⏭️  Skipped ${sign.name} — already stored for today`);
        results.push({ sign: sign.id, status: 'skipped' });
        continue;
      }

      // 2) Generate via OpenAI.
      console.log(`✨ Generating ${sign.name}...`);
      const content = await generateHoroscope(sign);

      // 3) Store in PocketBase (created/updated are auto-set by the schema).
      await pb.collection('horoscopes').create({
        sign: sign.id,
        date: day.value,
        content,
      });

      saved++;
      console.log(`💾 Saved ${sign.name}`);
      results.push({ sign: sign.id, status: 'saved' });
    } catch (err) {
      failed++;
      const msg = err?.message || String(err);
      console.error(`❌ Failed ${sign.name}: ${msg}`);
      results.push({ sign: sign.id, status: 'failed', error: msg });
    }
  }

  console.log(
    `📊 Done — 💾 ${saved} saved · ⏭️ ${skipped} skipped · ❌ ${failed} failed`
  );

  return NextResponse.json({
    date: day.value,
    summary: { saved, skipped, failed, total: zodiacSigns.length },
    results,
  });
}
