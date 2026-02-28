import "./globals.css";

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
        {/* Animated starfield background — shared across all pages */}
        <div className="starfield" aria-hidden="true" />

        {/* Page content renders above the starfield */}
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </body>
    </html>
  );
}
