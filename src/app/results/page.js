"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import zodiacSigns from "@/data/zodiac-signs.json";
import tarotCards from "@/data/tarot-cards.json";

/* ═══════════════════════════════════════════
   RESULTS SCREEN – app/results/page.js

   Layout (desktop — 2 columns, side by side):
   ┌──────────────────────────────────────────────────────┐
   │              Reading for Leo                         │
   │              Sunday, April 3, 2026                   │
   ├───────────────────────────┬──────────────────────────┤
   │  TAROT CARDS              │  HOROSCOPE               │
   │  [Past] [Present] [Future]│  AI horoscope text       │
   │                           │  Element · Planet        │
   │                           ├──────────────────────────┤
   │                           │  FORTUNE                 │
   │                           │  AI fortune text         │
   └───────────────────────────┴──────────────────────────┘

   Layout (mobile ≤720px — stacked vertically):
   ┌─────────────────────┐
   │  Reading for Leo    │
   │  Sunday, April 3    │
   ├─────────────────────┤
   │  TAROT CARDS        │
   │  [Past][Pres][Fut]  │
   ├─────────────────────┤
   │  HOROSCOPE          │
   │  text...            │
   ├─────────────────────┤
   │  FORTUNE            │
   │  text...            │
   └─────────────────────┘
   ═══════════════════════════════════════════ */

const RESULTS_STYLES = `

  /* ── Page title ── */
  .results-screen .page-title {
    font-size: clamp(1.4rem, 3vw, 2rem) !important;
    margin-bottom: 2px !important;
    color: #3D2B0A !important;
    text-shadow: none !important;
  }

  /* ── Date under title ── */
  .results-screen .page-date {
    font-size: clamp(1rem, 2vw, 1.3rem) !important;
    margin-bottom: 0 !important;
    color: #3D2B0A !important;
    opacity: 1 !important;
  }

  /* ── Section headers (Tarot Cards / Horoscope / Fortune) ── */
  .results-screen h2 {
    font-size: clamp(1.1rem, 2vw, 1.5rem) !important;
    margin-bottom: 2px !important;
    color: #3D2B0A !important;
    text-shadow: none !important;
  }

  /* ── Tarot card names ── */
  .results-screen h3 {
    font-size: 1rem !important;
    line-height: 1.2 !important;
    margin-bottom: 3px !important;
    color: #FFD700 !important;
    text-align: center !important;
    text-shadow: 0 0 8px rgba(255, 215, 0, 0.8), 0 0 16px rgba(255, 215, 0, 0.4) !important;
  }

  /* ── Past / Present / Future labels ── */
  .results-screen .card-position-label {
    font-size: 0.82rem !important;
    color: #F0D080 !important;
    text-shadow: 0 0 10px rgba(255,215,0,0.7), 0 0 20px rgba(255,215,0,0.4) !important;
    margin-bottom: 4px !important;
    text-align: center !important;
    width: 100% !important;
  }

  /* ── Card keywords ── */
  .results-screen .card-keywords {
    font-size: 0.85rem !important;
    color: #E8C84A !important;
    line-height: 1.4 !important;
    text-align: center !important;
    text-shadow: 0 0 6px rgba(232, 200, 74, 0.5) !important;
  }

  /* ── AI horoscope text ── */
  .results-screen .horoscope-text {
    font-size: 1.45rem !important;
    line-height: 1.45 !important;
    color: #3a2a10 !important;
  }

  /* ── Fortune text ── */
  .results-screen .fortune-text {
    font-size: 1.6rem !important;
    line-height: 1.6 !important;
    color: #1C0F00 !important;
  }

  /* ── Loading / error messages ── */
  .results-screen .panel-status-msg {
    font-size: 0.9rem !important;
  }

  /* ── Sign quick facts ── */
  .results-screen .sign-fact {
    font-size: 0.8rem !important;
  }

  /* ── Footer ── */
  .results-screen footer p {
    font-size: 0.75rem !important;
    margin-bottom: 2px !important;
  }

  /* ── Fallback ── */
  .results-screen .fallback-heading { font-size: 1.6rem !important; }
  .results-screen .fallback-body    { font-size: 1.1rem !important; }

  /* ── Loading spinner ── */
  .results-loading-msg { font-size: 1.2rem !important; }

  /* ══════════════════════════════════════════════════
     RESPONSIVE LAYOUT
     Desktop  (>720px):  2-column row, side by side
     Mobile  (<=720px):  single column, stacked
     ══════════════════════════════════════════════════ */

  /* Desktop default — row layout */
  .results-columns {
    flex-direction: row !important;
    align-items: flex-start !important;
  }

  /* Desktop — vertical gold divider visible */
  .results-col-divider {
    display: block !important;
  }

  /* Mobile — switch to column, hide vertical divider */
  @media (max-width: 720px) {
    .results-columns {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .results-col-divider {
      display: none !important;
    }

    /* On mobile, cards row should wrap so they don't overflow */
    .results-cards-row {
      flex-wrap: wrap !important;
      justify-content: center !important;
    }

    /* On mobile, each card slightly smaller to fit 3 across small screens */
    .results-screen .tarot-card {
      width: 110px !important;
      min-width: 110px !important;
      max-width: 110px !important;
    }

    /* On mobile, add a horizontal gold divider above horoscope */
    .results-col-text {
      border-top: 1px solid rgba(201, 168, 76, 0.35) !important;
      padding-top: 12px !important;
    }
  }

  /* Desktop — card size */
  @media (min-width: 721px) {
    .results-screen .tarot-card {
      width: 195px !important;
      min-width: 195px !important;
      max-width: 195px !important;
      flex-shrink: 0 !important;
    }
  }

  /* ══════════════════════════════════════════════════
     3D CARD FLIP ANIMATION
     ══════════════════════════════════════════════════ */

  /* Outer container establishes the 3D perspective */
  .card-flip-container {
    width: 100%;
    aspect-ratio: 3 / 4;
    perspective: 900px;
  }

  /* Inner wrapper holds both faces and does the rotation */
  .card-flip-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.85s cubic-bezier(0.45, 0.05, 0.55, 0.95);
  }

  /* Trigger the flip by rotating 180deg on Y axis */
  .card-flip-inner.is-flipped {
    transform: rotateY(180deg);
  }

  /* Both faces share the same space — hidden when facing away */
  .card-face-back,
  .card-face-front {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    overflow: hidden;
    background: var(--color-bg-deep);
  }

  /* Back of card faces the user initially (rotateY 0deg) */
  .card-face-back {
    transform: rotateY(0deg);
  }

  /* Front of card is hidden initially (rotateY 180deg) */
  .card-face-front {
    transform: rotateY(180deg);
  }

  /* Card text block (name + keywords) fades in after flip */
  .card-text-block {
    opacity: 0;
    transition: opacity 0.5s ease-in;
  }

  .card-text-block.is-visible {
    opacity: 1;
  }

  /* Subtle golden shimmer on the back of card while waiting to flip */
  @keyframes cardShimmer {
    0%   { box-shadow: 0 0 8px rgba(201,168,76,0.25); }
    50%  { box-shadow: 0 0 18px rgba(201,168,76,0.55), 0 0 32px rgba(201,168,76,0.2); }
    100% { box-shadow: 0 0 8px rgba(201,168,76,0.25); }
  }

  .card-flip-container.is-waiting {
    animation: cardShimmer 1.8s ease-in-out infinite;
  }
`;

// ──────────────────────────────────────────────────────────────
// Helper: Draw 3 tarot cards (random once per visitor per day)
// ──────────────────────────────────────────────────────────────
function drawThreeCards(allCards, signId) {
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const storageKey = `thf-draw-${signId}-${dateKey}`;

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedIds = JSON.parse(saved);
        const savedCards = savedIds
          .map((id) => allCards.find((c) => c.id === id))
          .filter(Boolean);
        if (savedCards.length === 3) return savedCards;
      }
    } catch (e) {}
  }

  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  const drawn = shuffled.slice(0, 3);

  if (typeof window !== "undefined") {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith("thf-draw-") && !key.endsWith(dateKey)) {
          localStorage.removeItem(key);
        }
      }
      localStorage.setItem(storageKey, JSON.stringify(drawn.map((c) => c.id)));
    } catch (e) {}
  }

  return drawn;
}

// ──────────────────────────────────────────────────────────────
// Helper: Format today's date
// ──────────────────────────────────────────────────────────────
function getTodayFormatted() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ──────────────────────────────────────────────────────────────
// Inner component
// ──────────────────────────────────────────────────────────────
function ResultsContent() {
  const searchParams = useSearchParams();
  const signId = searchParams.get("sign");

  const [isVisible, setIsVisible]         = useState(false);
  const [drawnCards, setDrawnCards]       = useState([]);
  const [horoscope, setHoroscope]         = useState("");
  const [fortune, setFortune]             = useState("");
  const [isLoadingReading, setIsLoading]  = useState(false);
  const [readingError, setReadingError]   = useState("");

  // flippedCards[i] = true means card i has completed its flip
  const [flippedCards, setFlippedCards]   = useState([false, false, false]);

  const signData = zodiacSigns.find((s) => s.id === signId);

  // ── Draw cards on mount ──
  useEffect(() => {
    if (signId) setDrawnCards(drawThreeCards(tarotCards, signId));
  }, [signId]);

  // ── Staggered card flip: 0.9s / 1.8s / 2.7s after cards are ready ──
  useEffect(() => {
    if (drawnCards.length !== 3) return;

    const delays = [900, 1800, 2700];
    const timers = delays.map((delay, i) =>
      setTimeout(() => {
        setFlippedCards((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [drawnCards]);

  // ── Fetch AI reading ──
  useEffect(() => {
    if (!signData || drawnCards.length !== 3) return;

    const today      = new Date();
    const dateKey    = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const readingKey = `thf-reading-${signId}-${dateKey}`;

    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(readingKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setHoroscope(parsed.horoscope);
          setFortune(parsed.fortune);
          return;
        }
      } catch (e) {}
    }

    setIsLoading(true);
    setReadingError("");

    fetch("/api/reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sign: signData, cards: drawnCards }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setReadingError("The oracle could not be reached. Please try again.");
        } else {
          setHoroscope(data.horoscope);
          setFortune(data.fortune);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(readingKey, JSON.stringify({
                horoscope: data.horoscope,
                fortune: data.fortune,
              }));
            } catch (e) {}
          }
        }
      })
      .catch(() => setReadingError("The oracle could not be reached. Please try again."))
      .finally(() => setIsLoading(false));
  }, [signData, drawnCards, signId]);

  const todayDate = getTodayFormatted();
  useEffect(() => { setIsVisible(true); }, []);

  // ── No sign selected ──
  if (!signData) {
    return (
      <>
        <style>{RESULTS_STYLES}</style>
        <main className="results-screen" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", textAlign: "center" }}>
          <h1 className="font-mystical fallback-heading" style={{ marginBottom: "12px" }}>No Sign Selected</h1>
          <p className="font-body fallback-body" style={{ marginBottom: "20px" }}>Please return to the home page and select your zodiac sign.</p>
          <a href="/" className="mystical-button">Return Home</a>
        </main>
      </>
    );
  }

  // ── Cards loading ──
  if (drawnCards.length === 0) {
    return (
      <>
        <style>{RESULTS_STYLES}</style>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p className="font-mystical text-gold results-loading-msg">Drawing your cards...</p>
        </main>
      </>
    );
  }

  const positions = ["Past", "Present", "Future"];

  return (
    <>
      <style>{RESULTS_STYLES}</style>

      <main
        className="results-screen"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "12px 20px 8px",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 1s ease-in",
        }}
      >

        {/* ── Page title: "Reading for [Sign]" ── */}
        <h1
          className="font-mystical page-title"
          style={{ fontWeight: 700, textAlign: "center" }}
        >
          Reading for {signData.name}
        </h1>

        {/* ── Date — larger, directly under title ── */}
        <p
          className="font-mystical page-date"
          style={{ textAlign: "center", marginBottom: "8px" }}
        >
          {todayDate}
        </p>

        <div className="gold-divider-short" style={{ marginBottom: "10px" }} />

        {/* ═══════════════════════════════════════════════════════════
            MAIN 2-COLUMN LAYOUT
            Desktop:  Left = Tarot cards | Right = Horoscope + Fortune
            Mobile:   Stacked — cards -> horoscope -> fortune
            ═══════════════════════════════════════════════════════════ */}
        <div
          className="results-columns"
          style={{
            width: "100%",
            maxWidth: "1200px",
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
          }}
        >

          {/* ══════════════════════════════════════════════
              LEFT COLUMN — TAROT CARDS (horizontal row)
              ══════════════════════════════════════════════ */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            alignSelf: "flex-start",
            flexShrink: 0,
            gap: "8px",
          }}>
            <h2
              className="font-mystical"
              style={{ fontWeight: 700, alignSelf: "center" }}
            >
              Tarot Cards
            </h2>
            <div className="gold-divider-short" style={{ alignSelf: "center" }} />

            {/* 3 cards side by side */}
            <div
              className="results-cards-row"
              style={{ display: "flex", flexDirection: "row", gap: "12px", flexWrap: "nowrap" }}
            >
              {drawnCards.map((card, index) => (
                <div
                  key={card.id}
                  className="tarot-card"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                >
                  {/* Position label — always visible */}
                  <p
                    className="font-mystical card-position-label"
                    style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}
                  >
                    {positions[index]}
                  </p>

                  {/* ── 3D flip container ── */}
                  <div
                    className={`card-flip-container${flippedCards[index] ? "" : " is-waiting"}`}
                    style={{ background: "var(--color-bg-deep)" }}
                  >
                    <div className={`card-flip-inner${flippedCards[index] ? " is-flipped" : ""}`}>

                      {/* BACK FACE — Back of Cards.png (shown first) */}
                      <div className="card-face-back">
                        <img
                          src="/images/tarot/Back of Cards.png"
                          alt="Card back"
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
                        />
                      </div>

                      {/* FRONT FACE — the drawn card image (revealed after flip) */}
                      <div className="card-face-front">
                        <img
                          src={card.image}
                          alt={card.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
                        />
                      </div>

                    </div>
                  </div>

                  {/* Card name + keywords — fade in after flip completes */}
                  <div
                    className={`card-text-block${flippedCards[index] ? " is-visible" : ""}`}
                    style={{ padding: "6px 6px 8px", width: "100%" }}
                  >
                    <h3 className="font-mystical" style={{ fontWeight: 700 }}>
                      {card.name}
                    </h3>
                    <p className="card-keywords" style={{ fontStyle: "italic" }}>
                      {card.keywords.join(" · ")}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* ── Vertical gold divider (desktop only) ── */}
          <div
            className="results-col-divider"
            style={{
              width: "1px",
              alignSelf: "stretch",
              background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.45), transparent)",
              flexShrink: 0,
            }}
          />

          {/* ══════════════════════════════════════════════════
              RIGHT COLUMN — HOROSCOPE + FORTUNE
              ══════════════════════════════════════════════════ */}
          <div
            className="results-col-text"
            style={{ flex: 1, minWidth: 0, alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: "10px" }}
          >

            {/* ── HOROSCOPE ── */}
            <section>
              <h2
                className="font-mystical"
                style={{ fontWeight: 700, textAlign: "center" }}
              >
                Horoscope
              </h2>
              <div className="gold-divider-short" style={{ marginBottom: "8px" }} />

              {isLoadingReading ? (
                <p className="font-mystical panel-status-msg" style={{ fontStyle: "italic", color: "var(--color-gold-dim)", textAlign: "center" }}>
                  The stars are aligning your reading...
                </p>
              ) : readingError ? (
                <p className="panel-status-msg" style={{ color: "#c0392b" }}>{readingError}</p>
              ) : (
                <p className="font-body horoscope-text">{horoscope}</p>
              )}

              {/* Sign quick facts */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
                <span className="text-dim sign-fact"><span className="text-gold">Element:</span> {signData.element}</span>
                <span className="text-dim sign-fact"><span className="text-gold">Planet:</span> {signData.rulingPlanet}</span>
                <span className="text-dim sign-fact"><span className="text-gold">Modality:</span> {signData.modality}</span>
              </div>
            </section>

            {/* Horizontal divider between horoscope and fortune */}
            <div className="gold-divider" style={{ margin: "0" }} />

            {/* ── FORTUNE ── */}
            <section>
              <h2
                className="font-mystical"
                style={{ fontWeight: 700, textAlign: "center" }}
              >
                Fortune
              </h2>
              <div className="gold-divider-short" style={{ marginBottom: "8px" }} />

              {isLoadingReading ? (
                <p className="font-mystical panel-status-msg" style={{ fontStyle: "italic", color: "var(--color-gold-dim)", textAlign: "center" }}>
                  The oracle is awakening...
                </p>
              ) : readingError ? (
                <p className="panel-status-msg" style={{ color: "#c0392b" }}>{readingError}</p>
              ) : (
                <p className="font-body fortune-text" style={{ fontStyle: "italic" }}>
                  &ldquo;{fortune}&rdquo;
                </p>
              )}
            </section>

          </div>{/* end right column */}
        </div>{/* end 2-column layout */}

        <div className="gold-divider" style={{ maxWidth: "700px", margin: "10px auto 6px" }} />

        {/* Footer */}
        <footer className="disclaimer-footer" style={{ maxWidth: "860px", textAlign: "center" }}>
          <p><a href="/">Home</a>{" · "}<a href="/agreement">User Agreement</a></p>
          <p>Readings are generated by AI for entertainment purposes only. Results may contain errors or inaccuracies.</p>
          <p>This site is not a provider of medical, mental health, or financial advice or treatment.</p>
          <p>For emergencies, call <strong>911</strong> or go to your nearest emergency room.</p>
        </footer>

      </main>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Wrap in Suspense for useSearchParams
// ──────────────────────────────────────────────────────────────
export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p className="font-mystical text-gold results-loading-msg">Consulting the stars...</p>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
