"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import zodiacSigns from "@/data/zodiac-signs.json";
import tarotCards from "@/data/tarot-cards.json";

/* ════════════════════════════════════════
   RESULTS SCREEN — app/results/page.js
   Displays: Tarot spread, Horoscope, Fortune
   ════════════════════════════════════════ */

// ──────────────── Helper: Draw 3 tarot cards (random once per visitor per day) ────────────────
// First visit of the day: draws 3 random cards and saves to browser storage.
// Subsequent visits same day + same sign: loads the saved draw.
function drawThreeCards(allCards, signId) {
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const storageKey = `thf-draw-${signId}-${dateKey}`;

  // Check if we already have a saved draw for this sign today
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedIds = JSON.parse(saved);
        const savedCards = savedIds
          .map((id) => allCards.find((c) => c.id === id))
          .filter(Boolean);
        if (savedCards.length === 3) {
          return savedCards;
        }
      }
    } catch (e) {
      // localStorage unavailable or corrupted — fall through to new draw
    }
  }

  // No saved draw — generate a new random one
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  const drawn = shuffled.slice(0, 3);

  // Save to browser storage
  if (typeof window !== "undefined") {
    try {
      // Clean up old draws (any key starting with "thf-draw-" that isn't today)
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith("thf-draw-") && !key.endsWith(dateKey)) {
          localStorage.removeItem(key);
        }
      }
      localStorage.setItem(storageKey, JSON.stringify(drawn.map((c) => c.id)));
    } catch (e) {
      // Storage full or unavailable — cards still work, just won't persist
    }
  }

  return drawn;
}

// ──────────────── Helper: Format today's date ────────────────
function getTodayFormatted() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ──────────────── Inner component that uses useSearchParams ────────────────
function ResultsContent() {
  const searchParams = useSearchParams();
  const signId = searchParams.get("sign");
  const dob = searchParams.get("dob");

  const [isVisible, setIsVisible] = useState(false);
  const [drawnCards, setDrawnCards] = useState([]);

  // Look up the zodiac sign data
  const signData = zodiacSigns.find((s) => s.id === signId);

  // Draw cards on client only (localStorage not available on server)
  useEffect(() => {
    if (signId) {
      setDrawnCards(drawThreeCards(tarotCards, signId));
    }
  }, [signId]);

  const todayDate = getTodayFormatted();

  // Fade-in on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ──────────────── If no sign selected, show error ────────────────
  if (!signData) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
          textAlign: "center",
        }}
      >
        <h1
          className="font-mystical text-gold"
          style={{ fontSize: "1.8rem", marginBottom: "16px" }}
        >
          No Sign Selected
        </h1>
        <p className="font-body" style={{ marginBottom: "24px" }}>
          Please return to the home page and select your zodiac sign.
        </p>
        <a href="/" className="mystical-button">
          ✦ Return Home ✦
        </a>
      </main>
    );
  }

  // ──────────────── Loading state while cards are drawn ────────────────
  if (drawnCards.length === 0) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p className="font-mystical text-gold" style={{ fontSize: "1.2rem" }}>
          Drawing your cards...
        </p>
      </main>
    );
  }

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
      {/* ════════════════════════════════════════
          SECTION 1: TAROT CARDS
          ════════════════════════════════════════ */}
      <section
        className="results-section"
        style={{
          width: "100%",
          maxWidth: "900px",
          marginBottom: "48px",
          textAlign: "center",
        }}
      >
        <h2
          className="font-mystical text-gold-bright"
          style={{
            fontSize: "clamp(1.4rem, 4vw, 2.4rem)",
            fontWeight: 700,
            marginBottom: "8px",
            textShadow: "0 0 30px rgba(255, 215, 0, 0.25)",
          }}
        >
          Tarot Cards
        </h2>
        <div className="gold-divider-short" />

        {/* 3 Tarot Cards — horizontal layout */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            flexWrap: "wrap",
            marginTop: "24px",
          }}
        >
          {drawnCards.map((card, index) => (
            <div
              key={card.id}
              className="tarot-card"
              style={{
                width: "220px",
                maxWidth: "calc(33% - 16px)",
                minWidth: "160px",
                animation: `fadeInUp 0.8s ease-out ${0.2 + index * 0.2}s both`,
              }}
            >
              {/* Card Image */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "2 / 3",
                  background: "var(--color-bg-deep)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    // Prevent infinite loop — only try fallback once
                    e.target.onerror = null;
                    e.target.style.display = "none";
                  }}
                />
              </div>

              {/* Card Info */}
              <div style={{ padding: "14px 12px" }}>
                <h3
                  className="font-mystical text-gold"
                  style={{
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    lineHeight: 1.3,
                  }}
                >
                  {card.name}
                </h3>
                <p
                  className="text-dim"
                  style={{
                    fontSize: "0.7rem",
                    marginBottom: "8px",
                    fontStyle: "italic",
                  }}
                >
                  {card.keywords.join(" · ")}
                </p>
                <p
                  className="font-body"
                  style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
                >
                  {card.upright.meaning}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="gold-divider" style={{ maxWidth: "700px" }} />

      {/* ════════════════════════════════════════
          SECTION 2: HOROSCOPE
          ════════════════════════════════════════ */}
      <section
        className="results-section"
        style={{
          width: "100%",
          maxWidth: "800px",
          marginBottom: "48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          {/* Zodiac Sign Image */}
          <div
            style={{
              width: "120px",
              height: "120px",
              flexShrink: 0,
              borderRadius: "50%",
              border: "2px solid var(--color-border-gold)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--color-bg-card)",
              boxShadow: "0 0 25px rgba(255, 215, 0, 0.1)",
            }}
          >
            <img
              src={signData.image}
              alt={signData.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Horoscope Text */}
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h2
              className="font-mystical text-gold-bright"
              style={{
                fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                fontWeight: 700,
                marginBottom: "4px",
                textShadow: "0 0 30px rgba(255, 215, 0, 0.25)",
              }}
            >
              Horoscope for {signData.name} {signData.symbol}
            </h2>
            <p
              className="text-gold"
              style={{
                fontSize: "0.9rem",
                marginBottom: "16px",
                opacity: 0.7,
              }}
            >
              {todayDate}
            </p>

            {/* Placeholder horoscope — will be replaced by AI-generated content */}
            <div
              className="mystical-panel"
              style={{ padding: "24px", marginBottom: "16px" }}
            >
              <p
                className="font-body"
                style={{ fontSize: "1.05rem", lineHeight: 1.7 }}
              >
                <em style={{ color: "var(--color-gold-dim)" }}>
                  Your personalized horoscope will appear here once the AI
                  reading engine is connected. The stars have aligned your cards
                  — {drawnCards[0].name}, {drawnCards[1].name}, and{" "}
                  {drawnCards[2].name} — with the energy of{" "}
                  {signData.name} to craft a reading uniquely yours.
                </em>
              </p>
              <p
                className="text-dim"
                style={{
                  fontSize: "0.8rem",
                  marginTop: "12px",
                  textAlign: "center",
                }}
              >
                ⏳ AI integration coming in a future session
              </p>
            </div>

            {/* Sign quick facts */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <span className="text-dim" style={{ fontSize: "0.8rem" }}>
                <span className="text-gold">Element:</span>{" "}
                {signData.element}
              </span>
              <span className="text-dim" style={{ fontSize: "0.8rem" }}>
                <span className="text-gold">Planet:</span>{" "}
                {signData.rulingPlanet}
              </span>
              <span className="text-dim" style={{ fontSize: "0.8rem" }}>
                <span className="text-gold">Modality:</span>{" "}
                {signData.modality}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="gold-divider" style={{ maxWidth: "700px" }} />

      {/* ════════════════════════════════════════
          SECTION 3: FORTUNE
          ════════════════════════════════════════ */}
      <section
        className="results-section"
        style={{
          width: "100%",
          maxWidth: "800px",
          marginBottom: "48px",
          textAlign: "center",
        }}
      >
        <h2
          className="font-mystical text-gold-bright"
          style={{
            fontSize: "clamp(1.4rem, 4vw, 2rem)",
            fontWeight: 700,
            marginBottom: "8px",
            textShadow: "0 0 30px rgba(255, 215, 0, 0.25)",
          }}
        >
          Fortune
        </h2>
        <div className="gold-divider-short" />

        {/* Placeholder fortune — will be replaced by AI-generated content */}
        <div
          className="mystical-panel"
          style={{
            padding: "32px 24px",
            marginTop: "16px",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <p
            className="font-body"
            style={{
              fontSize: "1.15rem",
              lineHeight: 1.7,
              fontStyle: "italic",
              color: "var(--color-gold-light)",
            }}
          >
            &ldquo;Your fortune will be revealed here once the oracle is
            awakened...&rdquo;
          </p>
          <p
            className="text-dim"
            style={{ fontSize: "0.8rem", marginTop: "12px" }}
          >
            ⏳ AI integration coming in a future session
          </p>
        </div>
      </section>

      <div className="gold-divider" style={{ maxWidth: "600px" }} />

      {/* ──────────────── Footer ──────────────── */}
      <footer className="disclaimer-footer" style={{ maxWidth: "600px" }}>
        <p style={{ marginBottom: "8px" }}>
          <a href="/">Home</a>
          {" · "}
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

// ──────────────── Wrap in Suspense for useSearchParams ────────────────
export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p className="font-mystical text-gold" style={{ fontSize: "1.2rem" }}>
            Consulting the stars...
          </p>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
