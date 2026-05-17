"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import zodiacSigns from "@/data/zodiac-signs.json";

/* ═══════════════════════════════════════════
   WELCOME SCREEN – app/page.js
   - Zodiac tile click → IMMEDIATE navigation to /results
   - DOB entry (react-datepicker) → "Reveal" button → /results
   - Tile sizing (glyph / name / date) lives in globals.css
   ═══════════════════════════════════════════ */

// ──────────────────────────────────────────────────────────
// Injected CSS — responsive grid columns, the DOB row layout,
// and the mystical navy/gold theme for the react-datepicker
// calendar popup. (Tile TEXT sizing is handled in globals.css.)
// ──────────────────────────────────────────────────────────
const WELCOME_STYLES = `

  /* ── Zodiac Grid: responsive columns ──
     12 tiles, so only 3 / 4 / 6 columns are used —
     each divides evenly into 12 for clean, full rows.   */
  .zodiac-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(3, 1fr);   /* mobile: 3 columns */
  }

  @media (min-width: 480px) {
    .zodiac-grid {
      grid-template-columns: repeat(4, 1fr); /* tablet: 4 columns */
    }
  }

  @media (min-width: 800px) {
    .zodiac-grid {
      grid-template-columns: repeat(6, 1fr); /* desktop: 6 columns */
    }
  }

  /* ── Mobile: tighter grid gap saves a little vertical space ── */
  @media (max-width: 799px) {
    .zodiac-grid {
      gap: 6px;
    }
  }

  /* ── DOB row: date input (grows) + Reveal button (fixed) ── */
  .dob-row {
    display: flex;
    gap: 8px;
    align-items: stretch;
  }

  /* react-datepicker wraps the input in its own elements — these
     rules make the input stretch to fill the flex row.            */
  .dob-row .dob-datepicker-wrapper {
    flex: 1;
    min-width: 0;
  }
  .dob-row .react-datepicker__input-container {
    display: block;
    height: 100%;
  }
  .dob-row .react-datepicker__input-container input {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  /* ── react-datepicker CALENDAR POPUP — mystical navy/gold theme ── */
  .react-datepicker-popper {
    z-index: 9999;   /* keep calendar above footer/dividers */
  }
  .react-datepicker {
    font-family: inherit;
    background-color: #13103a;
    border: 2px solid #C9A84C;
    border-radius: 10px;
    color: #ffffff;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
  }
  .react-datepicker__header {
    background-color: #0d0a2a;
    border-bottom: 1px solid rgba(201,168,76,0.4);
    padding-top: 8px;
  }
  .react-datepicker__current-month,
  .react-datepicker__day-name {
    color: #C9A84C;
    font-weight: 700;
  }
  .react-datepicker__day,
  .react-datepicker__time-name {
    color: #e8e0c8;
  }
  .react-datepicker__day:hover {
    background-color: rgba(201,168,76,0.35);
    border-radius: 50%;
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background-color: #C9A84C;
    color: #13103a;
    border-radius: 50%;
    font-weight: 700;
  }
  .react-datepicker__day--outside-month {
    color: rgba(232,224,200,0.3);
  }
  .react-datepicker__day--disabled {
    color: rgba(232,224,200,0.2);
  }
  /* Hide the little pointer triangle — it often misaligns */
  .react-datepicker__triangle {
    display: none;
  }
  /* Navigation arrows */
  .react-datepicker__navigation-icon::before {
    border-color: #C9A84C;
  }
  .react-datepicker__navigation:hover *::before {
    border-color: #ffffff;
  }
  /* Month / Year dropdown <select> menus — the reliable fix
     for the Firefox "stuck dropdown" bug (dropdownMode="select") */
  .react-datepicker__header__dropdown {
    margin: 8px 0 4px;
    display: flex;
    justify-content: center;
    gap: 6px;
  }
  .react-datepicker__month-select,
  .react-datepicker__year-select {
    background-color: #13103a;
    color: #C9A84C;
    border: 1px solid rgba(201,168,76,0.6);
    border-radius: 4px;
    padding: 3px 6px;
    font-family: inherit;
    font-size: 0.85rem;
    cursor: pointer;
  }
`;

// ──────────────────────────────────────────────────────────
// Helper: Determine zodiac sign from a month/day pair
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

// ──────────────────────────────────────────────────────────
// Helper: Convert a Date object to a "YYYY-MM-DD" string.
// Built manually (NOT via toISOString) so the local calendar
// date is preserved — toISOString shifts to UTC and can roll
// the date back a day for users in negative-offset timezones.
// ──────────────────────────────────────────────────────────
function formatDateForUrl(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function WelcomePage() {
  const router = useRouter();
  const [selectedSign, setSelectedSign] = useState(null);
  const [dob, setDob] = useState(null);          // a Date object (or null)
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  // DOB entry: react-datepicker passes a Date object (or null).
  // Update DOB and auto-detect sign. Does NOT navigate —
  // the user must click "Reveal".
  const handleDobChange = (date) => {
    setDob(date);
    if (date) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const detected = getZodiacFromDate(month, day);
      setSelectedSign(detected || null);
    } else {
      setSelectedSign(null);
    }
  };

  // Tile click: navigate IMMEDIATELY to /results (no submit button).
  const handleTileClick = (signId) => {
    const params = new URLSearchParams({ sign: signId });
    router.push(`/results?${params.toString()}`);
  };

  // Reveal button (DOB path): navigate to /results with sign + dob.
  const handleRevealReading = () => {
    if (!dob || !selectedSign) return;
    const params = new URLSearchParams({ sign: selectedSign, dob: formatDateForUrl(dob) });
    router.push(`/results?${params.toString()}`);
  };

  const selectedSignData = zodiacSigns.find((s) => s.id === selectedSign);
  const isRevealReady = Boolean(dob && selectedSign);

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
        {/* ── Keyframe animation + Reveal button styles ── */}
        <style>{`
          @keyframes pulseGlow {
            0%   { box-shadow: 0 0 14px 4px rgba(201,168,76,0.7), 0 0 28px 8px rgba(201,168,76,0.3), 0 0 0px 0px rgba(201,168,76,0); border-color: rgba(201,168,76,0.9); }
            50%  { box-shadow: 0 0 40px 16px rgba(201,168,76,1.0), 0 0 80px 30px rgba(201,168,76,0.6), 0 0 120px 50px rgba(201,168,76,0.2); border-color: rgba(201,168,76,1.0); }
            100% { box-shadow: 0 0 14px 4px rgba(201,168,76,0.7), 0 0 28px 8px rgba(201,168,76,0.3), 0 0 0px 0px rgba(201,168,76,0); border-color: rgba(201,168,76,0.9); }
          }
          .reveal-btn {
            animation: pulseGlow 1.8s ease-in-out infinite;
          }
          .reveal-btn:disabled {
            animation: none;
            box-shadow: 0 0 6px 2px rgba(201,168,76,0.3);
            opacity: 1;
            cursor: not-allowed;
            border-color: rgba(201,168,76,0.4);
            color: rgba(201,168,76,0.45);
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
            Choose Your Zodiac Sign to Reveal Your Reading
          </p>

          {/*
            zodiac-grid class handles responsive columns via CSS media queries:
              mobile  (<480px):    3 columns
              tablet  (480-800px): 4 columns
              desktop (800px+):    6 columns
            Tile glyph/name/date sizing is defined in globals.css.
          */}
          <div className="zodiac-grid">
            {zodiacSigns.map((sign) => (
              <div
                key={sign.id}
                className="zodiac-tile"
                onClick={() => handleTileClick(sign.id)}
                role="button"
                tabIndex={0}
                aria-label={`Reveal reading for ${sign.name}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleTileClick(sign.id);
                  }
                }}
              >
                {/* ── Unicode symbol ── */}
                <span className="glyph">
                  {sign.symbol + "\uFE0E"}
                </span>

                {/* ── Sign name ── */}
                <span className="sign-name">
                  {sign.name}
                </span>

                {/* ── Date range ── */}
                <span className="date-range">
                  {sign.dateRange.start} – {sign.dateRange.end}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────── DOB Input + Reveal Button — shared width container ──────────────── */}
        <div style={{ width: "100%", maxWidth: "480px", padding: "0 4px", boxSizing: "border-box" }}>

          {/* ── DOB label ── */}
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

          {/* ── Date picker + Reveal button row ── */}
          <div className="dob-row" style={{ marginBottom: "10px" }}>
            <DatePicker
              id="dob-input"
              selected={dob}
              onChange={handleDobChange}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"          /* native <select> menus — fixes Firefox stuck-dropdown bug */
              dateFormat="MM/dd/yyyy"
              placeholderText="MM/DD/YYYY"
              minDate={new Date(1910, 0, 1)}
              maxDate={new Date()}           /* a birth date cannot be in the future */
              className="mystical-input"
              wrapperClassName="dob-datepicker-wrapper"
            />
            <button
              className="reveal-btn"
              onClick={handleRevealReading}
              disabled={!isRevealReady}
              style={{
                fontSize: "clamp(0.8rem, 2vw, 0.95rem)",
                padding: "0 20px",
                fontWeight: 700,
                fontFamily: "inherit",
                letterSpacing: "0.12em",
                backgroundColor: "#13103a",
                color: "#C9A84C",
                border: "2px solid #C9A84C",
                borderRadius: "8px",
                cursor: isRevealReady ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Reveal
            </button>
          </div>

          {/* ── Sign Detected From DOB — confirms before user reveals reading ── */}
          {selectedSignData && (
            <div
              style={{
                textAlign: "center",
                marginBottom: "10px",
                animation: "fadeIn 0.5s ease-out",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                flexWrap: "wrap",
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

          {/* ── One reading per day notice ── */}
          <p
            className="font-mystical"
            style={{
              textAlign: "center",
              fontSize: "0.82rem",
              fontStyle: "italic",
              color: "#7a6840",
              letterSpacing: "0.04em",
              marginTop: "8px",
              marginBottom: "0",
            }}
          >
            ✦ One custom reading per day, per sign. Return tomorrow for a new draw and custom reading ✦
          </p>

        </div>{/* end shared width container */}

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
