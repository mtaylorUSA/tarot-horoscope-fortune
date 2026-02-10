// API Route: /api/reading
// Purpose: On-demand tailored reading per user visit
// Input: zodiac sign + 3 random tarot cards
// Process: Fetches generic horoscope from PocketBase, combines with tarot cards via OpenAI
// AI Calls: 1 per user visit

export async function POST(request) {
  return Response.json({ message: "reading endpoint — not yet implemented" });
}
