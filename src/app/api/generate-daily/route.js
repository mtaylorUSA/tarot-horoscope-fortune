// API Route: /api/generate-daily
// Purpose: Cron job that generates 12 daily generic horoscopes (one per zodiac sign)
// Trigger: Scheduled daily at midnight via Vercel Cron
// AI Calls: 12 per day (one per zodiac sign)

export async function GET(request) {
  return Response.json({ message: "generate-daily endpoint — not yet implemented" });
}
