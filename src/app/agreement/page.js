"use client";

import { useState, useEffect } from "react";

/* ════════════════════════════════════════
   USER AGREEMENT SCREEN — app/agreement/page.js
   Displays agreement text on a scroll-style
   overlay with mystical styling
   ════════════════════════════════════════ */

export default function AgreementPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
      {/* ──────────────── Header ──────────────── */}
      <header style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1
          className="font-mystical text-gold-bright"
          style={{
            fontSize: "clamp(1.6rem, 5vw, 2.6rem)",
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: "8px",
            textShadow: "0 0 40px rgba(255, 215, 0, 0.3)",
          }}
        >
          User Agreement
        </h1>
        <div className="gold-divider-short" />
      </header>

      {/* ════════════════════════════════════════
          SCROLL-STYLE AGREEMENT CONTAINER
          ════════════════════════════════════════ */}
      <div
        className="scroll-container"
        style={{
          width: "100%",
          maxWidth: "800px",
          marginBottom: "40px",
          position: "relative",
        }}
      >
        {/* Decorative scroll top ornament */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "24px",
            color: "var(--color-gold)",
            fontSize: "1.4rem",
            letterSpacing: "0.3em",
          }}
        >
          ⚜ ─── ✦ ─── ⚜
        </div>

        {/* ──────────────── Intellectual Property Rights ──────────────── */}
        <h2
          className="font-mystical text-gold"
          style={{
            fontSize: "1.1rem",
            marginBottom: "16px",
            letterSpacing: "0.08em",
          }}
        >
          Intellectual Property Rights
        </h2>

        <div className="font-body" style={{ marginBottom: "28px" }}>
          <p style={{ marginBottom: "12px" }}>
            All content made available through the Tarot Horoscope Fortune
            website and services, including but not limited to text, graphics,
            illustrations, images, icons, user interface elements, layouts,
            designs, logos, and visual assets (collectively,
            &ldquo;Content&rdquo;), is owned by Tarot Horoscope Fortune or its
            licensors and is protected by applicable copyright, trademark, and
            intellectual property laws.
          </p>

          <p style={{ marginBottom: "12px" }}>
            Certain visual assets, including tarot-inspired illustrations,
            zodiac symbols, and decorative graphics, are original, AI-assisted
            artworks created specifically for this service. These assets
            represent original visual expressions and are not reproductions of
            any traditional or copyrighted tarot decks, artworks, or proprietary
            designs.
          </p>

          <p style={{ marginBottom: "12px" }}>
            Zodiac glyphs used in visual assets are ancient, public-domain
            astrological symbols rendered in original artistic form and are
            included for symbolic and decorative purposes only.
          </p>

          <p style={{ marginBottom: "12px" }}>
            Users are granted a limited, non-exclusive, non-transferable,
            revocable license to access and view the Content solely for
            personal, non-commercial use in connection with the normal use of
            the website and services. No Content may be copied, reproduced,
            distributed, modified, displayed, performed, published, licensed, or
            otherwise exploited for any commercial or public purpose without
            prior written permission from Tarot Horoscope Fortune.
          </p>

          <p style={{ marginBottom: "12px" }}>
            Nothing in this Agreement grants users any ownership rights in the
            Content. All rights not expressly granted are reserved.
          </p>

          <p>
            Automated scraping, data harvesting, or bulk downloading of Content
            is prohibited without express written authorization.
          </p>
        </div>

        <div className="gold-divider" />

        {/* ──────────────── Interpretive Disclaimer ──────────────── */}
        <h2
          className="font-mystical text-gold"
          style={{
            fontSize: "1.1rem",
            marginBottom: "16px",
            letterSpacing: "0.08em",
          }}
        >
          Interpretive Disclaimer
        </h2>

        <div className="font-body" style={{ marginBottom: "28px" }}>
          <p style={{ marginBottom: "12px" }}>
            The tarot readings, horoscopes, fortunes, and all other content
            provided by Tarot Horoscope Fortune are generated by artificial
            intelligence and are intended solely for entertainment and
            informational purposes.
          </p>

          <p style={{ marginBottom: "12px" }}>
            This service does not provide medical, psychological, financial,
            legal, or professional advice of any kind. The content should not be
            used as a substitute for professional consultation, diagnosis, or
            treatment.
          </p>

          <p style={{ marginBottom: "12px" }}>
            AI-generated content may contain errors, inaccuracies, or
            inconsistencies. Tarot Horoscope Fortune makes no representations or
            warranties regarding the accuracy, completeness, or reliability of
            any content provided.
          </p>

          <p style={{ marginBottom: "12px" }}>
            Users acknowledge that tarot readings and horoscopes are symbolic
            and interpretive in nature. They are not predictive, diagnostic, or
            prescriptive.
          </p>

          <p>
            By using this service, you acknowledge and accept these terms. If
            you do not agree with these terms, please discontinue use of the
            service.
          </p>
        </div>

        <div className="gold-divider" />

        {/* ──────────────── Emergency Notice ──────────────── */}
        <h2
          className="font-mystical text-gold"
          style={{
            fontSize: "1.1rem",
            marginBottom: "16px",
            letterSpacing: "0.08em",
          }}
        >
          Emergency Notice
        </h2>

        <div className="font-body" style={{ marginBottom: "16px" }}>
          <p style={{ marginBottom: "12px" }}>
            If you or someone you know is experiencing a medical or mental
            health emergency, please call{" "}
            <strong style={{ color: "var(--color-gold)" }}>911</strong>{" "}
            immediately or go to your nearest emergency room.
          </p>

          <p>
            If you are experiencing a mental health crisis, please contact the{" "}
            <strong style={{ color: "var(--color-gold)" }}>
              988 Suicide &amp; Crisis Lifeline
            </strong>{" "}
            by calling or texting <strong>988</strong>.
          </p>
        </div>

        {/* Decorative scroll bottom ornament */}
        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            color: "var(--color-gold)",
            fontSize: "1.4rem",
            letterSpacing: "0.3em",
          }}
        >
          ⚜ ─── ✦ ─── ⚜
        </div>
      </div>

      <div className="gold-divider" style={{ maxWidth: "600px" }} />

      {/* ──────────────── Footer ──────────────── */}
      <footer className="disclaimer-footer" style={{ maxWidth: "600px" }}>
        <p style={{ marginBottom: "8px" }}>
          <a href="/">Home</a>
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
