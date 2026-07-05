// src/lib/pocketbase.js
// PocketBase client helper for Tarot Horoscope Fortune
// Provides two helpers:
//   getPocketBase()       — anonymous client for public read operations
//   getAdminPocketBase()  — superuser-authenticated client for write operations (cron jobs)
//
// NOTE: this file is server-only for getAdminPocketBase() (it uses secret
// credentials). Do NOT import getAdminPocketBase into any client/browser component.

import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.POCKETBASE_URL;

if (!POCKETBASE_URL) {
  throw new Error('POCKETBASE_URL environment variable is not set');
}

// ─── Anonymous Client ────────────────────────────────────────────────────────
// Use for public read operations (e.g. fetching today's horoscope for a user).
export function getPocketBase() {
  return new PocketBase(POCKETBASE_URL);
}

// ─── Admin (Superuser) Client ────────────────────────────────────────────────
// Use for write operations (e.g. cron job storing generated horoscopes).
// Authenticates as the dedicated pb-server@ superuser using credentials from
// environment variables.
//
// IMPORTANT: current PocketBase renamed "admins" to "superusers". The correct
// auth call is pb.collection('_superusers').authWithPassword(...). The old
// pb.admins.authWithPassword(...) no longer exists and will throw.
export async function getAdminPocketBase() {
  const pb = new PocketBase(POCKETBASE_URL);

  // Safer for a server environment handling multiple requests.
  pb.autoCancellation(false);

  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'POCKETBASE_ADMIN_EMAIL and/or POCKETBASE_ADMIN_PASSWORD environment variables are not set'
    );
  }

  // autoRefreshThreshold re-authenticates automatically when the token is within
  // 30 minutes of expiring, so the daily cron never fails on a stale token.
  await pb.collection('_superusers').authWithPassword(email, password, {
    autoRefreshThreshold: 30 * 60,
  });

  return pb;
}
