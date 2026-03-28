"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import zodiacSigns from "@/data/zodiac-signs.json";

/* ═══════════════════════════════════════════
   WELCOME SCREEN – app/page.js
   Clickable zodiac tiles, DOB input,
   "Get My Reading" button
   ═══════════════════════════════════════════ */

// ──────────────────────────────────────────────────────────
// Helper: Determine zodiac sign from DOB
// ──────────────────────────────────────────────────────────
function getZodiacFromDate(month, day) {
  for (const sign of zodiacSigns) {
    const { startMonth, startDay, endMonth, endDay } = sign.dateRange;
    if (startMonth === endMonth) {
      if (month === startMonth && day >= startDay && day <= endDay) return sign.id;
    } else if (startMonth > endMonth) {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) return sign.id;
    } else {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) return sign.id;
    }
  }
  return null;
}

export default function WelcomePage() {
  const router = useRouter();
  const [selectedSign, setSelectedSign] = useState(null);
  const [dob, setDob] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  const handleDobChange = (e) => {
    const value = e.target.value;
    setDob(value);
    if (value) {
      const dateObj = new Date(value + "T00:00:00");
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      const detected = getZodiacFromDate(month, day);
      if (detected) setSelectedSign(detected);
    }
  };

  const handleTileClick = (signId) => setSelectedSign(signId);

  const handleSubmit = () => {
    if (!selectedSign) return;
    const params = new URLSearchParams({ sign: selectedSign });
    if (dob) params.set("dob", dob);
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
      {/* ── Keyframe animations + tooltip styles ── */}
      <style>{`
        @keyframes pulseGlow {
          0%   { box-shadow: 0 0 20px 6px rgba(201,168,76,0.6), inset 0 0 12px rgba(201,168,76,0.15); }
          50%  { box-shadow: 0 0 50px 18px rgba(201,168,76,1.0), inset 0 0 20px rgba(201,168,76,0.3); }
          100% { box-shadow: 0 0 20px 6px rgba(201,168,76,0.6), inset 0 0 12px rgba(201,168,76,0.15); }
        }
        .reading-btn {
          animation: pulseGlow 1.8s ease-in-out infinite;
        }
        .reading-btn:disabled {
          animation: none;
          box-shadow: 0 0 10px 2px rgba(201,168,76,0.25);
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-tooltip-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 40px;
        }
        .btn-tooltip-wrapper .tooltip {
          visibility: hidden;
          opacity: 0;
          position: absolute;
          bottom: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          background-color: #13103a;
          color: #C9A84C;
          border: 1px solid #C9A84C;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 1rem;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          transition: opacity 0.2s ease;
          letter-spacing: 0.05em;
        }
        .btn-tooltip-wrapper .tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 6px;
          border-style: solid;
          border-color: #C9A84C transparent transparent transparent;
        }
        .btn-tooltip-wrapper:hover .tooltip.show {
          visibility: visible;
          opacity: 1;
        }
      `}</style>

      {/* ──────────────────── Title ──────────────────── */}
      <header style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1
          className="font-mystical"
          style={{
            fontSize: "clamp(1.6rem, 5vw, 3rem)",
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: "12px",
            color: "#2a1f0e",
            textShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          Tarot Horoscope Fortune
        </h1>
        <p
          className="font-body"
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            color: "#2a1f0e",
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          Discover what the stars and cards reveal for you today
        </p>
        <div className="gold-divider-short" />
      </header>

      {/* ──────────────────── Zodiac Tile Grid ──────────────────── */}
      <section style={{ width: "100%", maxWidth: "1200px", marginBottom: "28px" }}>
        <p
          className="font-mystical"
          style={{
            textAlign: "center",
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "16px",
            letterSpacing: "0.1em",
            color: "#1a1408",
          }}
        >
          Choose Your Zodiac Sign
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "14px",
          }}
        >
          {zodiacSigns.map((sign) => (
            <div
              key={sign.id}
              className={`zodiac-tile ${selectedSign === sign.id ? "selected" : ""}`}
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
              style={{
                backgroundColor: "#13103a",
                borderRadius: "12px",
                aspectRatio: "3 / 4",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 6px",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              {/* ── Unicode symbol ── */}
              <span
                className="glyph"
                style={{
                  fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
                  lineHeight: 1,
                  color: "#C9A84C",
                  marginBottom: "8px",
                  display: "block",
                  textShadow: "0 0 8px rgba(201,168,76,0.4)",
                }}
              >
                {sign.symbol + "\uFE0E"}
              </span>

              {/* ── Sign name ── */}
              <span
                className="sign-name"
                style={{
                  fontSize: "clamp(0.8rem, 1.3vw, 1.05rem)",
                  lineHeight: 1.2,
                  fontWeight: 600,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  marginBottom: "4px",
                }}
              >
                {sign.name}
              </span>

              {/* ── Date range — split into two lines ── */}
              {/* ── FIX 2026-03-28: White, bold, larger — all !important to override globals.css ── */}
              <span
                className="date-range"
                style={{
                  fontSize: "clamp(1.1rem, 2vw, 1.5rem) !important",
                  fontWeight: "700 !important",
                  color: "#ffffff !important",
                  lineHeight: 1.4,
                  textAlign: "center",
                }}
              >
                {sign.dateRange.start} –<br />{sign.dateRange.end}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────── Selected Sign Feedback ──────────────────── */}
      {selectedSignData && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            animation: "fadeIn 0.5s ease-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "2.2rem", lineHeight: 1, color: "#C9A84C", textShadow: "0 0 10px rgba(201,168,76,0.5)" }}>
            {selectedSignData.symbol + "\uFE0E"}
          </span>
          <span className="font-mystical" style={{ fontSize: "1.2rem", color: "#2a1f0e" }}>
            {selectedSignData.name}
          </span>
          <span style={{ fontSize: "0.95rem", color: "#5a4d3a" }}>
            {selectedSignData.element} · {selectedSignData.rulingPlanet}
          </span>
        </div>
      )}

      {/* ──────────────────── DOB Input ──────────────────── */}
      <section style={{ width: "100%", maxWidth: "480px", marginBottom: "28px" }}>
        <label
          className="font-mystical"
          htmlFor="dob-input"
          style={{
            display: "block",
            textAlign: "center",
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "16px",
            letterSpacing: "0.1em",
            color: "#1a1408",
          }}
        >
          Or Enter Your Date of Birth
        </label>
        <input
          id="dob-input"
          type="date"
          className="mystical-input"
          value={dob}
          onChange={handleDobChange}
          style={{
            textAlign: "center",
            fontSize: "1.5rem",
            padding: "16px",
            width: "100%",
          }}
        />
      </section>

      {/* ──────────────────── Get My Reading Button ──────────────────── */}
      <div className="btn-tooltip-wrapper">
        <span className={`tooltip ${!selectedSign ? "show" : ""}`}>
          ✦ Please select your star sign first ✦
        </span>
        <button
          className="reading-btn"
          onClick={handleSubmit}
          disabled={!selectedSign}
          style={{
            fontSize: "1.8rem",                             /* ── Larger text ── */
            padding: "24px 72px",                           /* ── Taller, wider ── */
            fontWeight: 800,                                /* ── Bolder ── */
            fontFamily: "inherit",
            letterSpacing: "0.12em",
            backgroundColor: "#C9A84C",
            color: "#13103a",
            border: "4px solid #8a6e2a",                   /* ── Thicker, darker border ── */
            borderRadius: "10px",
            cursor: selectedSign ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
            textTransform: "uppercase",                     /* ── All caps for impact ── */
          }}
        >
          ✦ Draw My Tarot Cards and Get My Reading ✦
        </button>
      </div>

      <div className="gold-divider" style={{ maxWidth: "600px" }} />

      {/* ──────────────────── Footer Disclaimers ──────────────────── */}
      <footer className="disclaimer-footer" style={{ maxWidth: "600px" }}>
        <p style={{ marginBottom: "8px" }}>
          <a href="/agreement">User Agreement</a>
        </p>
        <p style={{ marginBottom: "8px" }}>
          Readings are generated by AI for entertainment purposes only. Results may contain errors or inaccuracies.
        </p>
        <p style={{ marginBottom: "8px" }}>
          This site is not a provider of medical, mental health, or financial advice or treatment.
        </p>
        <p>
          For emergencies, call <strong>911</strong> or go to your nearest emergency room.
        </p>
      </footer>
    </main>
  );
}
