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
// Injected CSS — fixes !important on date-range (JS style
// objects do not support !important — must use real CSS)
// ──────────────────────────────────────────────────────────
const WELCOME_STYLES = `

  /* ── Zodiac Grid: responsive columns ── */
  .zodiac-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(3, 1fr);   /* mobile: 3 columns */
  }

  @media (min-width: 480px) {
    .zodiac-grid {
      grid-template-columns: repeat(4, 1fr); /* small tablet: 4 columns */
    }
  }

  @media (min-width: 700px) {
    .zodiac-grid {
      grid-template-columns: repeat(6, 1fr); /* desktop: 6 columns */
    }
  }

  /* ── Tile text: allow wrapping on very small screens ── */
  .welcome-screen .date-range {
    font-size: clamp(0.65rem, 2vw, 1.05rem) !important;
    font-weight: 700 !important;
    color: #ffffff !important;
    line-height: 1.3;
    text-align: center;
    white-space: normal;     /* was nowrap — allow wrap on mobile */
    word-break: break-word;
  }

  .welcome-screen .sign-name {
    font-size: clamp(0.65rem, 2vw, 1.05rem) !important;
    font-weight: 600;
    text-align: center;
    white-space: normal;     /* was nowrap — allow wrap on mobile */
    word-break: break-word;
  }

  .welcome-screen .glyph {
    font-size: clamp(1.4rem, 4vw, 2.8rem) !important;
  }

  /* ── Button: allow wrapping on narrow screens ── */
  .reading-btn {
    white-space: normal;
    word-break: break-word;
    text-align: center;
    width: 100%;
    max-width: 480px;
    box-sizing: border-box;
  }

  /* ── Tooltip wrapper: full width on mobile ── */
  .btn-tooltip-wrapper {
    width: 100%;
    max-width: 480px;
  }

  /* ── DOB Input: gold text + readable placeholder on all browsers ── */
  .dob-input {
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    font-size: 1.1rem;
    padding: 12px 10px;
    background-color: #13103a;
    color: #C9A84C;
    -webkit-text-fill-color: #C9A84C;   /* Safari / iOS override */
    border: 2px solid rgba(201,168,76,0.5);
    border-radius: 8px;
  }
  .dob-input::-webkit-datetime-edit        { color: #C9A84C; -webkit-text-fill-color: #C9A84C; }
  .dob-input::-webkit-datetime-edit-fields-wrapper { color: #C9A84C; }
  .dob-input::-webkit-datetime-edit-text   { color: rgba(201,168,76,0.6); }
  .dob-input::-webkit-date-and-time-value  { color: #C9A84C; }
  .dob-input::-webkit-calendar-picker-indicator {
    filter: invert(75%) sepia(40%) saturate(400%) hue-rotate(5deg); /* gold tint */
    cursor: pointer;
  }
`;

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
    <>
      <style>{WELCOME_STYLES}</style>
      <main
        className="welcome-screen"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "12px 16px 8px",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 1s ease-in",
        }}
      >
        {/* ── Keyframe animations + tooltip styles ── */}
        <style>{`
          @keyframes pulseGlow {
            0%   { box-shadow: 0 0 14px 4px rgba(201,168,76,0.7), 0 0 28px 8px rgba(201,168,76,0.3), 0 0 0px 0px rgba(201,168,76,0); border-color: rgba(201,168,76,0.9); }
            50%  { box-shadow: 0 0 40px 16px rgba(201,168,76,1.0), 0 0 80px 30px rgba(201,168,76,0.6), 0 0 120px 50px rgba(201,168,76,0.2); border-color: rgba(201,168,76,1.0); }
            100% { box-shadow: 0 0 14px 4px rgba(201,168,76,0.7), 0 0 28px 8px rgba(201,168,76,0.3), 0 0 0px 0px rgba(201,168,76,0); border-color: rgba(201,168,76,0.9); }
          }
          .reading-btn {
            animation: pulseGlow 1.8s ease-in-out infinite;
          }
          .reading-btn:disabled {
            animation: none;
            box-shadow: 0 0 6px 2px rgba(201,168,76,0.3);
            opacity: 1;
            cursor: not-allowed;
            border-color: rgba(201,168,76,0.4);
            color: rgba(201,168,76,0.45);
          }
          .btn-tooltip-wrapper {
            position: relative;
            display: flex;
            justify-content: center;
            margin-bottom: 12px;
          }
          .btn-tooltip-wrapper .tooltip {
            visibility: hidden;
            opacity: 0;
            position: absolute;
            bottom: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%);
            background-color: #13103a;
            color: #C9A84C;
            border: 1px solid #C9A84C;
            border-radius: 8px;
            padding: 6px 14px;
            font-size: 0.9rem;
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
        <header style={{ textAlign: "center", marginBottom: "10px" }}>
          <h1
            className="font-mystical"
            style={{
              fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)",
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: "6px",
              color: "#2a1f0e",
              textShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }}
          >
            Tarot Horoscope Fortune
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
              color: "#2a1f0e",
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            Discover what the stars and cards reveal for you today
          </p>
          <div className="gold-divider-short" style={{ marginTop: "8px", marginBottom: "0" }} />
        </header>

        {/* ──────────────────── Zodiac Tile Grid ──────────────────── */}
        <section style={{ width: "100%", maxWidth: "1000px", marginBottom: "10px" }}>
          <p
            className="font-mystical"
            style={{
              textAlign: "center",
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "8px",
              letterSpacing: "0.1em",
              color: "#1a1408",
            }}
          >
            Choose Your Zodiac Sign
          </p>

          {/*
            zodiac-grid class handles responsive columns via CSS media queries:
              mobile  (<480px):  3 columns
              tablet  (480-700px): 4 columns
              desktop (700px+):  6 columns
          */}
          <div className="zodiac-grid">
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
                  borderRadius: "10px",
                  aspectRatio: "4 / 3.6",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 4px",
                  cursor: "pointer",
                  overflow: "hidden",
                  gap: "2px",
                }}
              >
                {/* ── Unicode symbol ── */}
                <span
                  className="glyph"
                  style={{
                    lineHeight: 1,
                    color: "#C9A84C",
                    display: "block",
                    textShadow: "0 0 8px rgba(201,168,76,0.4)",
                  }}
                >
                  {sign.symbol + "\uFE0E"}
                </span>

                {/* ── Sign name ── */}
                <span className="sign-name">
                  {sign.name}
                </span>

                {/* ── Date range — real CSS handles !important via WELCOME_STYLES ── */}
                <span className="date-range">
                  {sign.dateRange.start} – {sign.dateRange.end}
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
              marginBottom: "8px",
              animation: "fadeIn 0.5s ease-out",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "1.6rem", lineHeight: 1, color: "#C9A84C", textShadow: "0 0 10px rgba(201,168,76,0.5)" }}>
              {selectedSignData.symbol + "\uFE0E"}
            </span>
            <span className="font-mystical" style={{ fontSize: "1rem", color: "#2a1f0e" }}>
              {selectedSignData.name}
            </span>
            <span style={{ fontSize: "0.85rem", color: "#5a4d3a" }}>
              {selectedSignData.element} · {selectedSignData.rulingPlanet}
            </span>
          </div>
        )}

        {/* ──────────────────── DOB Input ──────────────────── */}
        <section style={{ width: "100%", maxWidth: "480px", marginBottom: "14px" }}>
          <label
            className="font-mystical"
            htmlFor="dob-input"
            style={{
              display: "block",
              textAlign: "center",
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "8px",
              letterSpacing: "0.1em",
              color: "#1a1408",
            }}
          >
            Or Enter Your Date of Birth
          </label>
          <input
            id="dob-input"
            type="date"
            className="mystical-input dob-input"
            value={dob}
            onChange={handleDobChange}
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
              fontSize: "clamp(0.95rem, 2.5vw, 1.2rem)",
              padding: "14px 32px",
              fontWeight: 800,
              fontFamily: "inherit",
              letterSpacing: "0.12em",
              backgroundColor: "#13103a",
              color: "#C9A84C",
              border: "3px solid #C9A84C",
              borderRadius: "10px",
              cursor: selectedSign ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              textTransform: "uppercase",
            }}
          >
            ✦ Draw My Tarot Cards and Get My Reading ✦
          </button>
        </div>

        <div className="gold-divider" style={{ maxWidth: "600px", marginTop: "10px", marginBottom: "10px" }} />

        {/* ──────────────────── Footer Disclaimers ──────────────────── */}
        <footer className="disclaimer-footer" style={{ maxWidth: "600px" }}>
          <p style={{ marginBottom: "4px" }}>
            <a href="/agreement">User Agreement</a>
          </p>
          <p style={{ marginBottom: "4px" }}>
            Readings are generated by AI for entertainment purposes only. Results may contain errors or inaccuracies.
          </p>
          <p style={{ marginBottom: "4px" }}>
            This site is not a provider of medical, mental health, or financial advice or treatment.
          </p>
          <p>
            For emergencies, call <strong>911</strong> or go to your nearest emergency room.
          </p>
        </footer>
      </main>
    </>
  );
}
