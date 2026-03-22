import "./globals.css";
import GoldDust from "@/components/GoldDust";

export const metadata = {
  title: "Tarot Horoscope Fortune",
  description:
    "Discover your destiny through tarot cards, horoscopes, and personalized AI readings. Select your zodiac sign and receive a mystical fortune crafted by the stars.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts — Cinzel Decorative (headings) + Cormorant Garamond (body) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* ═══ Layered Animated Background ═══ */}
        <div className="bg-layers" aria-hidden="true">
          {/* Layer 1: Static base — champagne gold sparkle */}
          <div className="bg-layer bg-base" />

          {/* Layer 2: Mist A — slow drift, foreground */}
          <div className="bg-layer bg-mist-a" />

          {/* Layer 3: Mist B — slower drift, background (parallax) */}
          <div className="bg-layer bg-mist-b" />

          {/* Ghost figures rendered by GoldDust.js JS canvas — no CSS divs needed */}
        </div>

        {/* ═══ JS Particle System — individual drifting gold sparkles ═══ */}
        <GoldDust particleCount={120} />

        {/* Page content renders ABOVE all background layers (z-index: 10) */}
        <div style={{ position: "relative", zIndex: 10 }}>{children}</div>
      </body>
    </html>
  );
}
