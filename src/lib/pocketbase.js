// src/lib/pocketbase.js
// PocketBase client helper for Tarot Horoscope Fortune
// Provides two helpers:
//   getPocketBase()       — anonymous client for public read operations
//   getAdminPocketBase()  — admin-authenticated client for write operations (cron jobs)

import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.POCKETBASE_URL;

if (!POCKETBASE_URL) {
  throw new Error('POCKETBASE_URL environment variable is not set');
}

// ─── Anonymous Client ────────────────────────────────────────────────────────
// Use for public read operations (e.g. fetching today's horoscope for a user)
export function getPocketBase() {
  return new PocketBase(POCKETBASE_URL);
}

// ─── Admin Client ────────────────────────────────────────────────────────────
// Use for write operations (e.g. cron job storing generated horoscopes)
// Authenticates using admin credentials from environment variables
export async function getAdminPocketBase() {
  const pb = new PocketBase(POCKETBASE_URL);

  await pb.admins.authWithPassword(
    process.env.POCKETBASE_ADMIN_EMAIL,
    process.env.POCKETBASE_ADMIN_PASSWORD
  );

  return pb;
}
