"use client";

import { useEffect, useRef } from "react";

// ═════════════════════════════════════════════════════════════════════════════
// GoldDust.js — Gold dust particle system + Ghost figure system
// Updated: 2026-03-22 — Inverted brightness scale (1=subtle, 5=visible)
//
// ANIMATION MODEL (per figure):
//   1. Wait for initial delay (invisible)
//   2. Fade IN over fadeIn seconds
//   3. Hold at full brightness for hold seconds
//   4. Fade OUT over fadeOut seconds
//   5. Pause (invisible) for pause seconds
//   6. Repeat forever
//
// GRID (6 rows × 5 cols):
//   Cols: 1=0.00  2=0.25  3=0.50  4=0.75  5=1.00
//   Rows: A=0.00  B=0.20  C=0.40  D=0.60  E=0.80  F=1.00
//
//  ┌──────────┬──────────┬──────────┬──────────┬──────────┐
//  │ A1       │          │ A3 ⭐    │ A4       │ A5       │
//  │Temperance│          │  Sun     │ Libra    │ Hermit   │
//  ├──────────┼──────────┼──────────┼──────────┼──────────┤
//  │          │ B2       │          │          │          │
//  │          │ Pisces   │          │          │          │
//  ├──────────┼──────────┼──────────┼──────────┼──────────┤
//  │          │          │          │          │ C5       │
//  │          │          │          │          │ Aries    │
//  ├──────────┼──────────┼──────────┼──────────┼──────────┤
//  │          │ D2       │          │          │ D5       │
//  │          │Sagittariu│          │          │ Cancer   │
//  ├──────────┼──────────┼──────────┼──────────┼──────────┤
//  │ E1 ⭐    │ E2       │          │ E4       │          │
//  │  Leo     │ Aquarius │          │  Wheel   │          │
//  ├──────────┼──────────┼──────────┼──────────┼──────────┤
//  │ F1       │          │ F3       │          │          │
//  │ Scorpio  │          │  Moon    │          │          │
//  └──────────┴──────────┴──────────┴──────────┴──────────┘
//
// SIZE:  XS=0.12  S=0.16  M=0.20  L=0.24  XL=0.28  XXL=0.34  XXXL=0.44  XXXXL=0.55
//
// BRIGHTNESS SCALE (1=most subtle/faded, 5=most visible):
//   1 = Very Subtle  → brightness(120%), maxAlpha 0.10
//   2 = Subtle       → brightness(105%), maxAlpha 0.18
//   3 = Medium       → brightness(90%),  maxAlpha 0.28
//   4 = Visible      → brightness(78%),  maxAlpha 0.38
//   5 = Most Visible → brightness(65%),  maxAlpha 0.48
// ═════════════════════════════════════════════════════════════════════════════

const BASE_FILTER = "grayscale(85%) sepia(20%) contrast(80%) blur(2px)";

const SIZE = {
  XS: 0.12, S: 0.16, M: 0.20, L: 0.24,
  XL: 0.28, XXL: 0.34, XXXL: 0.44, XXXXL: 0.55,
};

// 1 = most subtle/faded, 5 = most visible
const BRIGHT = {
  1: { filter: "brightness(120%)", maxAlpha: 0.10 },
  2: { filter: "brightness(105%)", maxAlpha: 0.18 },
  3: { filter: "brightness(90%)",  maxAlpha: 0.28 },
  4: { filter: "brightness(78%)",  maxAlpha: 0.38 },
  5: { filter: "brightness(65%)",  maxAlpha: 0.48 },
};

const ROW = { A: 0.00, B: 0.20, C: 0.40, D: 0.60, E: 0.80, F: 1.00 };
const COL = { 1: 0.00, 2: 0.25, 3: 0.50, 4: 0.75, 5: 1.00 };

const GHOST_FIGURES = [

  // ── ROW A ─────────────────────────────────────────────────────────────────

  {
    // A1 — Temperance | M | 4/5 Visible
    src: "/images/backgrounds/ghost_temperance.png",
    size: SIZE.M,
    xFrac: COL[1], yFrac: ROW.A, xAnchor: 0.05, yAnchor: 0.05,
    bright: 2,
    delay: 0, fadeIn: 4, hold: 2, fadeOut: 4, pause: 6,
  },
  {
    // A3 — Sun ⭐ HERO | XXL | 5/5 Most Visible
    src: "/images/backgrounds/ghost_sun.png",
    size: SIZE.XXL,
    xFrac: COL[3], yFrac: ROW.A, xAnchor: 0.50, yAnchor: 0.05,
    bright: 5,
    delay: 0, fadeIn: 3, hold: 60, fadeOut: 3, pause: 2,
  },
  {
    // A4 — Libra | L | 4/5 Visible
    src: "/images/backgrounds/ghost_libra.png",
    size: SIZE.L,
    xFrac: COL[4], yFrac: ROW.A, xAnchor: 0.50, yAnchor: 0.05,
    bright: 2,
    delay: 6, fadeIn: 3, hold: 3, fadeOut: 5, pause: 5,
  },
  {
    // A5 — Hermit | M | 1/5 Very Subtle
    src: "/images/backgrounds/ghost_hermit.png",
    size: SIZE.M,
    xFrac: COL[5], yFrac: ROW.A, xAnchor: 0.95, yAnchor: 0.05,
    bright: 1,
    delay: 0, fadeIn: 4, hold: 2, fadeOut: 5, pause: 7,
  },

  // ── ROW B ─────────────────────────────────────────────────────────────────

  {
    // B2 — Pisces | XL | 2/5 Subtle
    src: "/images/backgrounds/ghost_pisces.png",
    size: SIZE.XL,
    xFrac: COL[2], yFrac: ROW.B, xAnchor: 0.50, yAnchor: 0.50,
    bright: 2,
    delay: 5, fadeIn: 3, hold: 6, fadeOut: 3, pause: 7,
  },

  // ── ROW C ─────────────────────────────────────────────────────────────────

  {
    // Aries — right red circle, just right of zodiac grid
    src: "/images/backgrounds/ghost_aries.png",
    size: SIZE.XL,
    xFrac: 0.83, yFrac: 0.38, xAnchor: 0.50, yAnchor: 0.50,
    bright: 2,
    delay: 11, fadeIn: 4, hold: 1, fadeOut: 5, pause: 5,
  },

  // ── ROW D ─────────────────────────────────────────────────────────────────

  {
    // Sagittarius — left red circle, just left of zodiac grid
    src: "/images/backgrounds/ghost_sagittarius.png",
    size: SIZE.M,
    xFrac: 0.22, yFrac: 0.40, xAnchor: 0.50, yAnchor: 0.50,
    bright: 2,
    delay: 23, fadeIn: 3, hold: 9, fadeOut: 3, pause: 10,
  },
  {
    // F5 — Cancer | L | 3/5 Medium (moved from D5 to fill lower-right corner)
    src: "/images/backgrounds/ghost_cancer.png",
    size: SIZE.L,
    xFrac: COL[5], yFrac: ROW.F, xAnchor: 0.95, yAnchor: 0.95,
    bright: 3,
    delay: 5, fadeIn: 4, hold: 3, fadeOut: 5, pause: 2,
  },

  // ── ROW E ─────────────────────────────────────────────────────────────────

  {
    // E1 — Leo ⭐ HERO | XXXL | 3/5 Medium — alternates with Scorpio, 20s cycle
    src: "/images/backgrounds/ghost_leo.png",
    size: SIZE.XXXL,
    xFrac: COL[1], yFrac: ROW.E, xAnchor: 0.30, yAnchor: 0.50,
    bright: 3,
    delay: 0, fadeIn: 3, hold: 7, fadeOut: 3, pause: 7,
  },
  {
    // E2 — Aquarius | L | 3/5 Medium
    src: "/images/backgrounds/ghost_acquarius.png",
    size: SIZE.L,
    xFrac: COL[2], yFrac: ROW.E, xAnchor: 0.50, yAnchor: 0.50,
    bright: 3,
    delay: 10, fadeIn: 4, hold: 6, fadeOut: 4, pause: 6,
  },
  {
    // E4 — Wheel | XL | 3/5 Medium
    src: "/images/backgrounds/ghost_wheel.png",
    size: SIZE.XL,
    xFrac: COL[4], yFrac: ROW.E, xAnchor: 0.50, yAnchor: 0.50,
    bright: 3,
    delay: 15, fadeIn: 3, hold: 3, fadeOut: 3, pause: 5,
  },

  // ── ROW F ─────────────────────────────────────────────────────────────────

  {
    // C1 — Scorpio | XL | 3/5 Medium — alternates with Leo
    src: "/images/backgrounds/ghost_scorpio.png",
    size: SIZE.XL,
    xFrac: COL[1], yFrac: ROW.C, xAnchor: 0.30, yAnchor: 0.50,
    bright: 3,
    delay: 11, fadeIn: 3, hold: 2, fadeOut: 3, pause: 8,
  },
  {
    // F3 — Moon | L | 3/5 Medium — low on canvas, peeks from bottom
    src: "/images/backgrounds/ghost_moon.png",
    size: SIZE.L,
    xFrac: COL[3], yFrac: ROW.F, xAnchor: 0.50, yAnchor: 0.30,
    bright: 3,
    delay: 10, fadeIn: 3, hold: 10, fadeOut: 3, pause: 4,
  },
];

// ── Compute alpha for a figure at elapsed seconds ─────────────────────────
function getAlpha(elapsed, fig, maxAlpha) {
  if (elapsed < fig.delay) return 0;

  const cycleTime     = elapsed - fig.delay;
  const cycleDuration = fig.fadeIn + fig.hold + fig.fadeOut + fig.pause;
  if (cycleDuration <= 0) return maxAlpha;

  const t = cycleTime % cycleDuration;

  if (fig.fadeIn > 0 && t < fig.fadeIn) {
    return maxAlpha * (t / fig.fadeIn);
  } else if (t < fig.fadeIn + fig.hold) {
    return maxAlpha;
  } else if (fig.fadeOut > 0 && t < fig.fadeIn + fig.hold + fig.fadeOut) {
    const fadeProgress = (t - fig.fadeIn - fig.hold) / fig.fadeOut;
    return maxAlpha * (1 - fadeProgress);
  } else {
    return 0;
  }
}

// ── Load one image ─────────────────────────────────────────────────────────
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════════════════════════════
export default function GoldDust({ particleCount = 120 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    let animationId;
    let alive     = true;
    let startTime = null;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Gold dust particles ────────────────────────────────────────────────
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x:           Math.random() * canvas.width,
        y:           Math.random() * canvas.height,
        radius:      1.5 + Math.random() * 2,
        driftX:      1.2 + Math.random() * 0.8,
        driftY:      -(0.2 + Math.random() * 0.3),
        pulseSpeed:  0.008 + Math.random() * 0.015,
        pulseOffset: Math.random() * Math.PI * 2,
        baseAlpha:   0.6 + Math.random() * 0.35,
      });
    }

    // ── Load ghost images ──────────────────────────────────────────────────
    const ghostImages = new Array(GHOST_FIGURES.length).fill(null);
    Promise.all(
      GHOST_FIGURES.map((fig, i) =>
        loadImage(fig.src).then((img) => {
          if (alive) ghostImages[i] = img;
        })
      )
    );

    // ── Animation loop ─────────────────────────────────────────────────────
    const draw = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Ghost figures (behind gold dust)
      for (let i = 0; i < GHOST_FIGURES.length; i++) {
        const img = ghostImages[i];
        if (!img) continue;

        const fig                  = GHOST_FIGURES[i];
        const { filter, maxAlpha } = BRIGHT[fig.bright];
        const alpha                = getAlpha(elapsed, fig, maxAlpha);
        if (alpha <= 0) continue;

        const w = fig.size * canvas.width;
        const h = w * (img.naturalHeight / img.naturalWidth);
        const x = fig.xFrac * canvas.width  - w * fig.xAnchor;
        const y = fig.yFrac * canvas.height - h * fig.yAnchor;

        ctx.save();
        ctx.filter      = BASE_FILTER + " " + filter;
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
      }

      // 2. Gold dust particles (on top)
      for (const p of particles) {
        p.x += p.driftX;
        p.y += p.driftY;

        if (p.x > canvas.width  + 10) { p.x = -10;               p.y = Math.random() * canvas.height; }
        if (p.y < -10)                 { p.y = canvas.height + 10; p.x = Math.random() * canvas.width;  }

        const pulse = Math.sin(timestamp * 0.001 * p.pulseSpeed * 60 + p.pulseOffset);
        const alpha = p.baseAlpha * (0.75 + 0.25 * pulse);

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
        gradient.addColorStop(0,   `rgba(245, 228, 155, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(235, 215, 140, ${alpha * 0.5})`);
        gradient.addColorStop(1,   `rgba(225, 205, 130, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      alive = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100%",
        height:        "100%",
        zIndex:        7,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
