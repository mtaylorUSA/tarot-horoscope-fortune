"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import zodiacSigns from "@/data/zodiac-signs.json";

/* ════════════════════════════════════════
   WELCOME SCREEN — app/page.js
   Clickable zodiac tiles, DOB input,
   "Get My Reading" button
   ════════════════════════════════════════ */

// ──────────────── Helper: Determine zodiac sign from DOB ────────────────
function getZodiacFromDate(month, day) {
  // Returns the zodiac sign id that matches the given month/day
  // Handles the wrap-around for Capricorn (Dec 22 – Jan 19)
  for (const sign of zodiacSigns) {
    const { startMonth, startDay, endMonth, endDay } = sign.dateRange;

    if (startMonth === endMonth) {
      // Same month range (unlikely but safe)
      if (month === startMonth && day >= startDay && day <= endDay) {
        return sign.id;
      }
    } else if (startMonth > endMonth) {
      // Wraps around year boundary (Capricorn: Dec 22 – Jan 19)
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay)
      ) {
        return sign.id;
      }
    } else {
      // Normal range within the same year
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay)
      ) {
        return sign.id;
      }
    }
  }
  return null;
}

export default function WelcomePage() {
  const router = useRouter();
  const [selectedSign, setSelectedSign] = useState(null);
  const [dob, setDob] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Fade-in on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ──────────────── When DOB changes, auto-detect zodiac sign ────────────────
  const handleDobChange = (e) => {
    const value = e.target.value;
    setDob(value);

    if (value) {
      const dateObj = new Date(value + "T00:00:00");
      const month = dateObj.getMonth() + 1; // 1-based
      const day = dateObj.getDate();
      const detected = getZodiacFromDate(month, day);
      if (detected) {
        setSelectedSign(detected);
      }
    }
  };

  // ──────────────── When tile clicked, select that sign ────────────────
  const handleTileClick = (signId) => {
    setSelectedSign(signId);
  };

  // ──────────────── Submit → navigate to Results ────────────────
  const handleSubmit = () => {
    if (!selectedSign) return;

    // Build query params for the results page
    const params = new URLSearchParams({
      sign: selectedSign,
    });
    if (dob) {
      params.set("dob", dob);
    }
    router.push(`/results?${params.toString()}`);
  };

  const selectedSignData = zodiacSigns.find((s) => s.id === selectedSign);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 16px 24px",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 1s ease-in",
      }}
    >
      {/* ──────────────── Title ──────────────── */}
      <header style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1
          className="font-mystical text-gold-bright"
          style={{
            fontSize: "clamp(1.6rem, 5vw, 3rem)",
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: "8px",
            textShadow: "0 0 40px rgba(255, 215, 0, 0.3)",
          }}
        >
          Tarot Horoscope Fortune
        </h1>
        <p
          className="font-body text-gold"
          style={{
            fontSize: "clamp(0.95rem, 2vw, 1.2rem)",
            opacity: 0.8,
          }}
        >
          Discover what the stars and cards reveal for you today
        </p>
        <div className="gold-divider-short" />
      </header>

      {/* ──────────────── Zodiac Tile Grid ──────────────── */}
      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          marginBottom: "28px",
        }}
      >
        <p
          className="font-mystical text-gold-light"
          style={{
            textAlign: "center",
            fontSize: "0.9rem",
            marginBottom: "16px",
            letterSpacing: "0.1em",
          }}
        >
          Choose Your Zodiac Sign
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            gap: "10px",
          }}
        >
          {zodiacSigns.map((sign) => (
            <div
              key={sign.id}
              className={`zodiac-tile ${
                selectedSign === sign.id ? "selected" : ""
              }`}
              onClick={() => handleTileClick(sign.id)}
              role="button"
              tabIndex={0}
              aria-label={`Select ${sign.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleTileClick(sign.id);
                }
              }}
            >
              <span className="glyph">{sign.symbol}</span>
              <span className="sign-name">{sign.name}</span>
              <span className="date-range">
                {sign.dateRange.start} – {sign.dateRange.end}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────── Selected Sign Feedback ──────────────── */}
      {selectedSignData && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            animation: "fadeIn 0.5s ease-out",
          }}
        >
          <span
            style={{
              fontSize: "1.8rem",
              color: "var(--color-gold-bright)",
              marginRight: "8px",
            }}
          >
            {selectedSignData.symbol}
          </span>
          <span
            className="font-mystical text-gold-light"
            style={{ fontSize: "1.1rem" }}
          >
            {selectedSignData.name}
          </span>
          <span
            className="text-dim"
            style={{ fontSize: "0.85rem", marginLeft: "8px" }}
          >
            {selectedSignData.element} · {selectedSignData.rulingPlanet}
          </span>
        </div>
      )}

      {/* ──────────────── DOB Input ──────────────── */}
      <section
        style={{
          width: "100%",
          maxWidth: "400px",
          marginBottom: "28px",
        }}
      >
        <label
          className="font-mystical text-gold"
          htmlFor="dob-input"
          style={{
            display: "block",
            fontSize: "0.85rem",
            marginBottom: "8px",
            textAlign: "center",
            letterSpacing: "0.08em",
          }}
        >
          Date of Birth
        </label>
        <input
          id="dob-input"
          type="date"
          className="mystical-input"
          value={dob}
          onChange={handleDobChange}
          style={{ textAlign: "center" }}
        />
        <p
          className="text-dim"
          style={{
            fontSize: "0.75rem",
            textAlign: "center",
            marginTop: "6px",
          }}
        >
          Enter your DOB to auto-detect your sign, or select a tile above
        </p>
      </section>

      {/* ──────────────── Get My Reading Button ──────────────── */}
      <button
        className="mystical-button"
        onClick={handleSubmit}
        disabled={!selectedSign}
        style={{ marginBottom: "40px" }}
      >
        ✦ Get My Reading ✦
      </button>

      <div className="gold-divider" style={{ maxWidth: "600px" }} />

      {/* ──────────────── Footer Disclaimers ──────────────── */}
      <footer className="disclaimer-footer" style={{ maxWidth: "600px" }}>
        <p style={{ marginBottom: "8px" }}>
          <a href="/agreement">User Agreement</a>
        </p>
        <p style={{ marginBottom: "8px" }}>
          Readings are generated by AI for entertainment purposes only. Results
          may contain errors or inaccuracies.
        </p>
        <p style={{ marginBottom: "8px" }}>
          This site is not a provider of medical, mental health, or financial
          advice or treatment.
        </p>
        <p>
          For emergencies, call <strong>911</strong> or go to your nearest
          emergency room.
        </p>
      </footer>
    </main>
  );
}
