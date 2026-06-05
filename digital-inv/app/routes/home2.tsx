import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Calendar,
  MapPin,
  Clock,
  Heart,
  Music,
  Camera,
  Sparkles,
  Send,
  Check,
  ChevronRight,
  ChevronLeft,
  Settings,
  X,
  Play,
  Pause,
  Wand2,
  MessageSquare,
  Loader2,
  HelpCircle,
  Gift,
  Copy,
  Book,
} from "lucide-react";

// --- PALETTES ---
const THEMES = {
  champagne: {
    name: "Champagne Gold",
    primaryBg: "bg-stone-50",
    cardBg: "bg-white",
    textPrimary: "text-stone-800",
    textSecondary: "text-stone-600",
    accent: "text-amber-700",
    accentBg: "bg-amber-700",
    accentHover: "hover:bg-amber-800",
    border: "border-amber-200/60",
    ring: "focus:ring-amber-500",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    gradient: "from-amber-100/40 to-stone-100",
    divider: "border-amber-100",
    vinylGradient:
      "radial-gradient(circle, #2d2a2a 0%, #171515 25%, #0c0a0a 45%, #1f1d1d 55%, #050505 70%, #1a1818 85%, #000000 100%)",
    vinylBorder: "border-stone-950",
    vinylGroovePrimary: "border-stone-600/25",
    vinylGrooveSecondary: "border-stone-700/15",
    vinylLabelBg: "bg-stone-50",
    vinylLabelBorderHex: "#1c1917",
    vinylLabelText: "text-stone-500",
    vinylAccentText: "text-amber-800",
    vinylCenterDot: "bg-stone-900 border-stone-800",
    portalOverlayBg: "bg-stone-950",
    portalGradient: "from-stone-900/60 to-stone-950",
    portalFrameBorder: "border-amber-200/20",
    portalFrameBg: "bg-stone-900/40",
    portalSvg: "text-amber-200/50",
    portalTagline: "text-amber-200/70",
    portalHeading: "text-amber-100",
    portalAmpersand: "text-amber-200/60",
    portalDesc: "text-stone-300",
    portalBtnBg: "bg-amber-100",
    portalBtnText: "text-stone-900",
    portalBtnHover: "hover:bg-white",
    portalHeartText: "text-amber-800",
    portalHeartFill: "fill-amber-700",
    portalDate: "text-stone-400",
  },
  rose: {
    name: "Dusty Rose",
    primaryBg: "bg-zinc-50",
    cardBg: "bg-white",
    textPrimary: "text-zinc-800",
    textSecondary: "text-zinc-600",
    accent: "text-rose-700",
    accentBg: "bg-rose-700",
    accentHover: "hover:bg-rose-800",
    border: "border-rose-200/60",
    ring: "focus:ring-rose-500",
    badge: "bg-rose-50 text-rose-800 border-rose-200",
    gradient: "from-rose-50 to-zinc-100",
    divider: "border-rose-100",
    vinylGradient:
      "radial-gradient(circle, #2d2a2a 0%, #171515 25%, #0c0a0a 45%, #1f1d1d 55%, #050505 70%, #1a1818 85%, #000000 100%)",
    vinylBorder: "border-stone-950",
    vinylGroovePrimary: "border-stone-600/25",
    vinylGrooveSecondary: "border-stone-700/15",
    vinylLabelBg: "bg-rose-50",
    vinylLabelBorderHex: "#1c1917",
    vinylLabelText: "text-rose-900",
    vinylAccentText: "text-rose-700",
    vinylCenterDot: "bg-stone-900 border-stone-800",
    portalOverlayBg: "bg-zinc-950",
    portalGradient: "from-rose-900/50 to-zinc-950",
    portalFrameBorder: "border-rose-200/20",
    portalFrameBg: "bg-zinc-900/40",
    portalSvg: "text-rose-200/50",
    portalTagline: "text-rose-200/70",
    portalHeading: "text-rose-100",
    portalAmpersand: "text-rose-200/60",
    portalDesc: "text-zinc-300",
    portalBtnBg: "bg-rose-100",
    portalBtnText: "text-zinc-900",
    portalBtnHover: "hover:bg-white",
    portalHeartText: "text-rose-800",
    portalHeartFill: "fill-rose-700",
    portalDate: "text-zinc-400",
  },
  navy: {
    name: "Classic Navy",
    primaryBg: "bg-slate-950",
    cardBg: "bg-slate-900/90",
    textPrimary: "text-slate-100",
    textSecondary: "text-slate-300",
    accent: "text-sky-400",
    accentBg: "bg-sky-600",
    accentHover: "hover:bg-sky-500",
    border: "border-slate-800",
    ring: "focus:ring-sky-500",
    badge: "bg-slate-800 text-sky-200 border-slate-700",
    gradient: "from-slate-950 to-slate-900",
    divider: "border-slate-800/80",
    vinylGradient:
      "radial-gradient(circle, #121AAA 0%, #0f2044 25%, #071a3e 45%, #0e2040 55%, #020a1a 70%, #0b1d3d 85%, #000810 100%)",
    vinylBorder: "border-sky-900",
    vinylGroovePrimary: "border-sky-500/30",
    vinylGrooveSecondary: "border-sky-400/15",
    vinylLabelBg: "bg-slate-700",
    vinylLabelBorderHex: "#0c4a6e",
    vinylLabelText: "text-slate-300",
    vinylAccentText: "text-sky-300",
    vinylCenterDot: "bg-slate-900 border-slate-700",
    portalOverlayBg: "bg-slate-950",
    portalGradient: "from-slate-800/60 to-slate-950",
    portalFrameBorder: "border-sky-400/20",
    portalFrameBg: "bg-slate-900/60",
    portalSvg: "text-sky-400/50",
    portalTagline: "text-sky-300/80",
    portalHeading: "text-slate-100",
    portalAmpersand: "text-sky-300/60",
    portalDesc: "text-slate-300",
    portalBtnBg: "bg-sky-200",
    portalBtnText: "text-slate-900",
    portalBtnHover: "hover:bg-sky-100",
    portalHeartText: "text-sky-700",
    portalHeartFill: "fill-sky-600",
    portalDate: "text-slate-400",
  },
  burgundy: {
    name: "Royal Burgundy",
    primaryBg: "bg-stone-50",
    cardBg: "bg-white",
    textPrimary: "text-stone-950",
    textSecondary: "text-stone-700",
    accent: "text-red-900",
    accentBg: "bg-red-900",
    accentHover: "hover:bg-red-950",
    border: "border-red-200/60",
    ring: "focus:ring-red-700",
    badge: "bg-red-50 text-red-900 border-red-200",
    gradient: "from-red-50 to-stone-100",
    divider: "border-red-100",
    vinylGradient:
      "radial-gradient(circle, #3d1515 0%, #2a0a0a 25%, #1a0505 45%, #2a0a0a 55%, #0d0202 70%, #1f0808 85%, #080000 100%)",
    vinylBorder: "border-red-950",
    vinylGroovePrimary: "border-red-700/25",
    vinylGrooveSecondary: "border-red-800/15",
    vinylLabelBg: "bg-stone-50",
    vinylLabelBorderHex: "#450a0a",
    vinylLabelText: "text-stone-600",
    vinylAccentText: "text-red-900",
    vinylCenterDot: "bg-red-950 border-red-900",
    portalOverlayBg: "bg-stone-950",
    portalGradient: "from-red-900/50 to-stone-950",
    portalFrameBorder: "border-red-200/20",
    portalFrameBg: "bg-stone-900/40",
    portalSvg: "text-red-200/50",
    portalTagline: "text-red-200/70",
    portalHeading: "text-red-100",
    portalAmpersand: "text-red-200/60",
    portalDesc: "text-stone-300",
    portalBtnBg: "bg-red-100",
    portalBtnText: "text-stone-900",
    portalBtnHover: "hover:bg-white",
    portalHeartText: "text-red-800",
    portalHeartFill: "fill-red-700",
    portalDate: "text-stone-400",
  },
};

// Beautiful romantic stock images for the polaroids & lightbox
const GIFT_ACCOUNTS = [
  {
    label: "Rekening (1)",
    account: "1410023266968",
    name: "Aln Pujo Priambodo",
  },
  {
    label: "Rekening (2)",
    account: "1230010940908",
    name: "Alfiana Yuniarianti",
  },
];

const CARD_GRADIENTS: Record<string, string> = {
  champagne: "linear-gradient(135deg, #5c3d1c 0%, #2c1c08 50%, #7a5030 100%)",
  rose: "linear-gradient(135deg, #7c1d4a 0%, #3d0c22 50%, #9c2d5a 100%)",
  navy: "linear-gradient(135deg, #1a3a6e 0%, #0a1a38 50%, #2a4a7e 100%)",
  burgundy: "linear-gradient(135deg, #6b1525 0%, #35080f 50%, #8b2030 100%)",
};

const formatAccount = (acc: string) => acc.match(/.{1,4}/g)?.join(" ") ?? acc;

const LOVE_STORY_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
    title: "How We Met",
    desc: "A chance encounter on a rainy autumn afternoon that sparked a lifetime of conversations.",
    date: "October 14, 2021",
  },
  {
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
    title: "The Proposal",
    desc: "Under a blanket of stars at the whispering edge of the ocean, we promised our forevers.",
    date: "August 24, 2024",
  },
  {
    url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800",
    title: "Engaged Days",
    desc: "Building a foundation of laughter, deep support, and dreams of the beautiful family we'll raise.",
    date: "Present",
  },
];

export default function App2() {
  const [currentThemeKey, setCurrentThemeKey] =
    useState<keyof typeof THEMES>("navy");
  const t = THEMES[currentThemeKey];

  // Interactivity States
  const [isOpened, setIsOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rsvpList, setRsvpList] = useState([
    {
      name: "Julian & Sarah",
      status: "attending",
      message: "So thrilled to witness your gorgeous love story unfold!",
      timestamp: "Just now",
    },
    {
      name: "Grandma Evelyn",
      status: "attending",
      message:
        "Wouldn't miss this for the world, my sweet children. Love you both.",
      timestamp: "2 hours ago",
    },
    {
      name: "Thomas Sterling",
      status: "maybe",
      message:
        "Hoping to make it! Safe travels to all family members coming from afar.",
      timestamp: "1 day ago",
    },
  ]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    guests: "1",
    status: "attending",
    wishes: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cardAnimKey, setCardAnimKey] = useState(0);
  const [cardFromRight, setCardFromRight] = useState(true);

  const switchCard = (dir: "prev" | "next") => {
    setCardFromRight(dir === "next");
    setCardAnimKey((k) => k + 1);
    setActiveCardIndex((i) =>
      dir === "next"
        ? (i + 1) % GIFT_ACCOUNTS.length
        : (i - 1 + GIFT_ACCOUNTS.length) % GIFT_ACCOUNTS.length,
    );
  };

  // Audio Reference
  const audioRef = useRef<HTMLAudioElement>(null);

  // Hero hearts canvas
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroMouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const heroThemeRef = useRef(currentThemeKey);

  // Keep theme ref in sync
  useEffect(() => {
    heroThemeRef.current = currentThemeKey;
  }, [currentThemeKey]);

  // Raining hearts canvas animation
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const HEART_COLORS: Record<string, string[]> = {
      champagne: ["#d97706", "#b45309", "#fbbf24", "#f59e0b", "#fcd34d"],
      rose: ["#f43f5e", "#e11d48", "#fb7185", "#fda4af", "#be123c"],
      navy: ["#38bdf8", "#0ea5e9", "#7dd3fc", "#bae6fd", "#93c5fd"],
      burgundy: ["#dc2626", "#b91c1c", "#ef4444", "#fca5a5", "#7f1d1d"],
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    interface HeartParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      rotation: number;
      rotSpeed: number;
      colorIndex: number;
    }

    const NUM = 38;
    const hearts: HeartParticle[] = Array.from({ length: NUM }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: Math.random() * 0.8 + 0.3,
      size: Math.random() * 12 + 7,
      opacity: Math.random() * 0.35 + 0.1,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.025,
      colorIndex: Math.floor(Math.random() * 5),
    }));

    const drawHeart = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rot: number,
      color: string,
      alpha: number,
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, -size * 0.3);
      c.bezierCurveTo(
        size * 0.5,
        -size * 0.7,
        size,
        -size * 0.15,
        0,
        size * 0.5,
      );
      c.bezierCurveTo(
        -size,
        -size * 0.15,
        -size * 0.5,
        -size * 0.7,
        0,
        -size * 0.3,
      );
      c.fill();
      c.restore();
    };

    const REPEL_RADIUS = 110;
    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const colors = HEART_COLORS[heroThemeRef.current] ?? HEART_COLORS.rose;
      const { x: mx, y: my } = heroMouseRef.current;

      for (const h of hearts) {
        // Cursor repulsion
        const dx = h.x - mx;
        const dy = h.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0.5) {
          const strength = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 3;
          h.vx += (dx / dist) * strength;
          h.vy += (dy / dist) * strength;
        }

        // Damping + gravity
        h.vx *= 0.95;
        h.vy = h.vy * 0.97 + 0.025;
        h.vx = Math.max(-4, Math.min(4, h.vx));
        h.vy = Math.max(-4, Math.min(4, h.vy));
        h.x += h.vx;
        h.y += h.vy;
        h.rotation += h.rotSpeed;

        // Wrap
        if (h.y > canvas.height + h.size * 2) {
          h.y = -h.size * 2;
          h.x = Math.random() * canvas.width;
          h.vx = (Math.random() - 0.5) * 0.6;
          h.vy = Math.random() * 0.6 + 0.3;
        }
        if (h.x < -h.size * 2) h.x = canvas.width + h.size;
        if (h.x > canvas.width + h.size * 2) h.x = -h.size;

        drawHeart(
          ctx,
          h.x,
          h.y,
          h.size,
          h.rotation,
          colors[h.colorIndex],
          h.opacity,
        );
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    const obs = new ResizeObserver(resize);
    obs.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      obs.disconnect();
    };
  }, []);

  // Event Countdown Target (e.g., November 28, 2026)
  const targetDate = new Date("Nov 28, 2026 10:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference < 0) {
        clearInterval(timer);
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Music Toggle
  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e: unknown) => {
          console.log("Audio play deferred for user interaction", e);
          setIsPlaying(false);
        });
    }
  };

  // Open Invitation Sequence
  const handleOpenInvitation = () => {
    setIsOpened(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((e: unknown) => {
            console.log(
              "Audio autoplay prevented by browser. Guest can play manually.",
              e,
            );
            setIsPlaying(false);
          });
      }
    }, 400);
  };

  // Handle RSVP Submission
  const handleRsvpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newRsvp = {
      name: formData.name,
      status: formData.status,
      message: formData.wishes || "Sending you our warmest blessings!",
      timestamp: "Just now",
    };

    setRsvpList([newRsvp, ...rsvpList]);
    setFormSubmitted(true);
  };

  // Gemini API integration function
  const callGeminiAPI = async (prompt: string, systemInstruction = "") => {
    const apiKey = ""; // Leave as empty string, Canvas automatically injects key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction
        ? { parts: [{ text: systemInstruction }] }
        : undefined,
    };

    // Exponential Backoff implementation
    let delay = 1000;
    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        throw new Error("Empty response payload received");
      } catch (error) {
        if (i === 2) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  return (
    <div
      className={`min-h-screen ${t.primaryBg} ${t.textPrimary} transition-colors duration-1000 relative overflow-x-hidden font-sans`}
    >
      {/* INJECTED CUSTOM CSS */}
      <style>{`
        @keyframes vinyl-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .custom-spin-slow {
          animation: vinyl-spin 12s linear infinite;
        }
        .custom-spin-paused {
          animation-play-state: paused;
        }
        /* Custom scrollbar to keep layout clean */
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        @keyframes card-slide-in-right {
          from { transform: translateX(80px); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes card-slide-in-left {
          from { transform: translateX(-80px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        .card-enter-right { animation: card-slide-in-right 0.45s cubic-bezier(0.4,0,0.2,1) both; }
        .card-enter-left  { animation: card-slide-in-left  0.45s cubic-bezier(0.4,0,0.2,1) both; }
      `}</style>

      {/* Background Classical Music Track */}
      <audio
        ref={audioRef}
        loop
        src="./media/audio/The Beatles - Here, There and Everywhere.mp3"
      />

      {/* Floating Theme Selector Button */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-stone-200 transition-all duration-300 hover:shadow-xl">
        <Settings
          className="w-4 h-4 text-stone-500 animate-spin"
          style={{ animationDuration: "8s" }}
        />
        <span className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
          Theme:
        </span>
        <div className="flex gap-1.5">
          {Object.keys(THEMES).map((key) => (
            <button
              key={key}
              onClick={() => setCurrentThemeKey(key as keyof typeof THEMES)}
              title={THEMES[key as keyof typeof THEMES].name}
              className={`w-5 h-5 rounded-full border border-stone-300 transition-all duration-300 ${
                currentThemeKey === key
                  ? "ring-2 ring-offset-2 ring-stone-800 scale-110"
                  : "hover:scale-105"
              }`}
              style={{
                backgroundColor:
                  key === "champagne"
                    ? "#d97706"
                    : key === "rose"
                      ? "#be123c"
                      : key === "navy"
                        ? "#0f172a"
                        : "#7f1d1d",
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Audio Playback Controller */}
      {isOpened && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          <span className="bg-stone-900/90 text-white text-[10px] tracking-wider px-2.5 py-1 rounded-md shadow-lg pointer-events-none transition-all duration-300 border border-stone-800">
            {isPlaying ? "Stop Music" : "Play Music"}
          </span>
          <button
            onClick={toggleMusic}
            aria-label={isPlaying ? "Stop Music" : "Play Music"}
            className={`p-4 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 flex items-center justify-center border ${
              isPlaying
                ? `${t.accentBg} text-white border-transparent animate-pulse`
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            {isPlaying ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6 text-stone-400" />
            )}
          </button>
        </div>
      )}

      {/* OVERLAY / ENTRY PORTAL */}
      {!isOpened && (
        <div
          className={`fixed inset-0 z-50 ${t.portalOverlayBg} flex flex-col justify-center items-center px-4 overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-80 transition-all duration-[8000ms] scale-105 hover:scale-100">
            <img
              src="https://images.pexels.com/photos/29404698/pexels-photo-29404698.jpeg"
              className="w-full h-full object-cover filter grayscale"
              alt="Background wedding venue"
            />
          </div>

          <div
            className={`absolute inset-0 bg-gradient-to-b ${t.portalGradient}`}
          />

          {/* Luxury Frame Container */}
          <div
            className={`relative z-10 max-w-lg w-full text-center p-8 md:p-12 border ${t.portalFrameBorder} rounded-2xl ${t.portalFrameBg} backdrop-blur-lg flex flex-col items-center shadow-2xl`}
          >
            <div className="mb-6">
              <svg
                className={`w-24 h-12 ${t.portalSvg} fill-current`}
                viewBox="0 0 100 40"
              >
                <path d="M50 0 C 40 10, 20 15, 0 15 C 20 15, 30 25, 50 40 C 70 25, 80 15, 100 15 C 80 15, 60 10, 50 0 Z" />
              </svg>
            </div>

            <span
              className={`${t.portalTagline} font-serif tracking-[0.25em] text-xs uppercase mb-3`}
            >
              You are Cordially Invited
            </span>

            <h1
              className={`text-4xl md:text-5xl font-serif ${t.portalHeading} font-light tracking-wide leading-tight mb-4`}
            >
              Alfiana <br />
              <span
                className={`text-xl md:text-2xl italic font-serif ${t.portalAmpersand}`}
              >
                &amp;
              </span>
              <br />
              Aln Pujo
            </h1>

            <p
              className={`${t.portalDesc} font-serif text-sm italic mb-8 tracking-wide`}
            >
              To witness and celebrate a love that grew like a slow, classic
              symphony.
            </p>

            <button
              onClick={handleOpenInvitation}
              className={`group px-8 py-3.5 ${t.portalBtnBg} ${t.portalBtnText} ${t.portalBtnHover} text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-300 rounded-md shadow-lg flex items-center gap-2 transform active:scale-95`}
            >
              Open Invitation
              <Heart
                className={`w-3.5 h-3.5 ${t.portalHeartText} ${t.portalHeartFill} group-hover:scale-125 transition-transform duration-300`}
              />
            </button>

            <div
              className={`mt-8 ${t.portalDate} text-[10px] tracking-widest uppercase`}
            >
              November 28th, 2026 • Kota Bandung, Indonesia
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX FOR STORIES */}
      {activePhotoIndex !== null && (
        <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full max-h-[90dvh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-300 relative">
            <button
              onClick={() => setActivePhotoIndex(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-stone-800 hover:text-stone-950 hover:scale-105 shadow transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex-1 min-h-0 w-full bg-stone-100 overflow-hidden relative">
              <img
                src={LOVE_STORY_IMAGES[activePhotoIndex].url}
                alt={LOVE_STORY_IMAGES[activePhotoIndex].title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-shrink-0 p-6 md:p-8">
              <span className="text-[10px] uppercase font-semibold tracking-widest text-amber-800 block mb-1">
                {LOVE_STORY_IMAGES[activePhotoIndex].date}
              </span>
              <h3 className="font-serif text-2xl text-stone-800 font-bold mb-3">
                {LOVE_STORY_IMAGES[activePhotoIndex].title}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed font-sans mb-6">
                {LOVE_STORY_IMAGES[activePhotoIndex].desc}
              </p>

              <div className="flex justify-between items-center">
                <button
                  disabled={activePhotoIndex === 0}
                  onClick={() => setActivePhotoIndex((prev) => (prev ?? 1) - 1)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  disabled={activePhotoIndex === LOVE_STORY_IMAGES.length - 1}
                  onClick={() => setActivePhotoIndex((prev) => (prev ?? 0) + 1)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN WEBSITE */}
      <div
        className={`transition-all duration-1000 transform ${isOpened ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        {/* HERO SECTION */}
        <section
          className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden border-b border-stone-200"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            heroMouseRef.current = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            };
          }}
          onMouseLeave={() => {
            heroMouseRef.current = { x: -9999, y: -9999 };
          }}
        >
          {/* Raining hearts canvas */}
          <canvas
            ref={heroCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
          <div className="absolute inset-0 flex justify-center items-center opacity-5 pointer-events-none">
            <svg
              className="w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] stroke-current"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
              <path d="M50 0 L50 100 M0 50 L100 50" strokeWidth="0.2" />
            </svg>
          </div>

          <div className="relative z-10 max-w-4xl py-20 flex flex-col items-center">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${t.badge} text-xs font-semibold tracking-widest uppercase mb-8 transition-all duration-500`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              We Are Getting Married
            </span>

            <h1 className="text-5xl md:text-8xl font-serif tracking-wide font-light leading-tight mb-6">
              Alfiana{" "}
              <span
                className={`italic text-3xl md:text-6xl font-serif ${t.accent}`}
              >
                &amp;
              </span>{" "}
              Aln Pujo
            </h1>

            <div className="w-32 h-[1px] bg-stone-300 my-4 relative">
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${t.accentBg}`}
              />
            </div>

            <p className="font-serif text-lg md:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mt-4 leading-relaxed tracking-wide px-4">
              <i>We created you in pairs</i>
            </p>

            <div className="mt-8 flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm tracking-widest uppercase font-medium">
                <Book className="w-4 h-4" /> Surah An-Naba, Ayah 8
              </div>
              {/* <div className="text-xs text-stone-400 font-serif italic mt-1">
                Ten O'Clock in the Morning
              </div> */}
            </div>

            {/* <div className="mt-12 animate-bounce">
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400">
                Scroll to Explore
              </div>
              <div className="w-[1px] h-10 bg-stone-300 mx-auto mt-2" />
            </div> */}
          </div>
        </section>

        {/* GROOM & BRIDE SECTION */}
        <section className={`py-24 px-4 ${t.primaryBg} border-b ${t.divider}`}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span
                className={`text-xs uppercase tracking-[0.3em] ${t.accent} font-semibold`}
              >
                Two Hearts, One Soul
              </span>
              <h2
                className={`text-3xl md:text-5xl font-serif ${t.textPrimary} font-light mt-2`}
              >
                The Couple
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_56px_1fr] gap-12 md:gap-0 items-center">
              {/* GROOM */}
              <div className="flex flex-col items-center text-center gap-6">
                {/* Classical portrait frame */}
                <div
                  className={`relative p-3 ${t.cardBg} border ${t.border} shadow-2xl`}
                >
                  {/* Corner ornaments */}
                  <span
                    className={`absolute top-1.5 left-1.5 w-5 h-5 border-t-2 border-l-2 ${t.border}`}
                  />
                  <span
                    className={`absolute top-1.5 right-1.5 w-5 h-5 border-t-2 border-r-2 ${t.border}`}
                  />
                  <span
                    className={`absolute bottom-1.5 left-1.5 w-5 h-5 border-b-2 border-l-2 ${t.border}`}
                  />
                  <span
                    className={`absolute bottom-1.5 right-1.5 w-5 h-5 border-b-2 border-r-2 ${t.border}`}
                  />
                  <div className="w-52 h-72 overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/29068093/pexels-photo-29068093.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Aln Pujo Priambodo"
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                </div>

                <div>
                  <p
                    className={`text-xs uppercase tracking-[0.3em] ${t.accent} font-semibold mb-2`}
                  >
                    The Groom
                  </p>
                  <h3
                    className={`font-serif text-xl md:text-2xl ${t.textPrimary} font-semibold tracking-wider mb-3`}
                  >
                    ALN PUJO PRIAMBODO
                  </h3>
                  <p className={`${t.textSecondary} text-sm leading-relaxed`}>
                    Son of Mr. Alib
                    <br />
                    &amp; Mrs. Nur Nasekhah
                  </p>
                </div>
              </div>

              {/* Center divider — desktop */}
              <div className="hidden md:flex flex-col items-center self-stretch justify-center">
                <div className={`flex-1 w-px ${t.accentBg} opacity-20`} />
                <div
                  className={`my-4 w-10 h-10 rounded-full ${t.cardBg} border-2 ${t.border} flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  <Heart className={`w-4 h-4 ${t.accent}`} />
                </div>
                <div className={`flex-1 w-px ${t.accentBg} opacity-20`} />
              </div>

              {/* Center divider — mobile */}
              <div className="flex md:hidden items-center gap-4 w-full">
                <div className={`flex-1 h-px ${t.accentBg} opacity-30`} />
                <Heart className={`w-4 h-4 ${t.accent} flex-shrink-0`} />
                <div className={`flex-1 h-px ${t.accentBg} opacity-30`} />
              </div>

              {/* BRIDE */}
              <div className="flex flex-col items-center text-center gap-6">
                {/* Classical portrait frame */}
                <div
                  className={`relative p-3 ${t.cardBg} border ${t.border} shadow-2xl`}
                >
                  {/* Corner ornaments */}
                  <span
                    className={`absolute top-1.5 left-1.5 w-5 h-5 border-t-2 border-l-2 ${t.border}`}
                  />
                  <span
                    className={`absolute top-1.5 right-1.5 w-5 h-5 border-t-2 border-r-2 ${t.border}`}
                  />
                  <span
                    className={`absolute bottom-1.5 left-1.5 w-5 h-5 border-b-2 border-l-2 ${t.border}`}
                  />
                  <span
                    className={`absolute bottom-1.5 right-1.5 w-5 h-5 border-b-2 border-r-2 ${t.border}`}
                  />
                  <div className="w-52 h-72 overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/12396627/pexels-photo-12396627.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Alfiana Yuniarianti"
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                </div>

                <div>
                  <p
                    className={`text-xs uppercase tracking-[0.3em] ${t.accent} font-semibold mb-2`}
                  >
                    The Bride
                  </p>
                  <h3
                    className={`font-serif text-xl md:text-2xl ${t.textPrimary} font-semibold tracking-wider mb-3`}
                  >
                    ALFIANA YUNIARIANTI
                  </h3>
                  <p className={`${t.textSecondary} text-sm leading-relaxed`}>
                    Daughter of Mr. Ach. Tugianto
                    <br />
                    &amp; Mrs. Nurida Wijayanti
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COUNTDOWN SECTION */}
        <section
          className={`py-12 bg-gradient-to-b ${t.gradient} transition-colors duration-1000`}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="font-serif text-xs tracking-[0.25em] text-stone-500 dark:text-stone-400 uppercase mb-8">
              Counting down to our forever
            </h3>

            <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto">
              {[
                { label: "Days", val: timeLeft.days },
                { label: "Hours", val: timeLeft.hours },
                { label: "Mins", val: timeLeft.minutes },
                { label: "Secs", val: timeLeft.seconds },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`${t.cardBg} backdrop-blur-md rounded-xl p-3 md:p-5 border ${t.border} shadow-sm flex flex-col items-center`}
                >
                  <span
                    className={`text-2xl md:text-4xl font-serif font-light ${t.textPrimary}`}
                  >
                    {String(item.val).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] tracking-widest uppercase text-stone-400 mt-1 font-semibold">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOVE STORY / VINYL GALLERY SECTION */}
        <section
          id="story"
          className={`py-24 px-4 overflow-hidden relative ${t.primaryBg}`}
        >
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span
                className={`text-xs uppercase tracking-[0.3em] ${t.accent} font-semibold`}
              >
                Our Journey
              </span>
              <h2
                className={`text-3xl md:text-5xl font-serif ${t.textPrimary} font-light mt-2 mb-4`}
              >
                Love Story
              </h2>
              <p
                className={`${t.textSecondary} text-sm md:text-base leading-relaxed`}
              >
                Music has always been the thread that wove us together. Click
                any of the polaroids scattered on our classical soundtrack
                record to read a fragment of our story.
              </p>
            </div>

            {/* THE GRAPHOPHONE RECORD AND POLAROIDS GRID WITH STRICT MOBILE PROTECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center overflow-hidden lg:overflow-visible">
              {/* Left Side: Fluid, fully responsive, non-overflowing Vinyl & Polaroids assembly */}
              <div className="lg:col-span-7 flex justify-center items-center relative py-6 md:py-12 px-2 overflow-hidden md:overflow-visible min-h-[360px] sm:min-h-[460px] md:min-h-[550px]">
                {/* Fluid scaling wrapper: Scales down elements linearly on smaller screens 
                  to completely prevent horizontal overflow-x and unresized images on mobile viewport.
                */}
                <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center transform scale-[0.75] xs:scale-[0.85] sm:scale-95 md:scale-100 origin-center transition-transform duration-300">
                  {/* Gramophone Record (VINYL) */}
                  <div
                    className={`absolute left-[-22%] sm:left-[-28%] md:left-[-32%] w-[92%] sm:w-[100%] md:w-[110%] aspect-square rounded-full shadow-[0_20px_45px_-10px_rgba(0,0,0,0.85)] border-[5px] ${t.vinylBorder} flex items-center justify-center overflow-hidden select-none custom-spin-slow ${
                      isPlaying ? "" : "custom-spin-paused"
                    }`}
                    style={{
                      background: t.vinylGradient,
                      transition: "transform 0.5s ease-out",
                      clipPath: "circle(50%)",
                    }}
                  >
                    {/* Vinyl Grooves */}
                    <div
                      className={`absolute inset-[5%] rounded-full border ${t.vinylGroovePrimary}`}
                    />
                    <div
                      className={`absolute inset-[15%] rounded-full border ${t.vinylGrooveSecondary}`}
                    />
                    <div
                      className={`absolute inset-[25%] rounded-full border ${t.vinylGroovePrimary}`}
                    />
                    <div
                      className={`absolute inset-[35%] rounded-full border ${t.vinylGrooveSecondary}`}
                    />
                    <div
                      className={`absolute inset-[45%] rounded-full border ${t.vinylGroovePrimary}`}
                    />
                    <div
                      className={`absolute inset-[55%] rounded-full border ${t.vinylGrooveSecondary}`}
                    />
                    <div
                      className={`absolute inset-[65%] rounded-full border ${t.vinylGroovePrimary}`}
                    />

                    {/* Central Record Label */}
                    <div
                      className={`absolute w-[36%] h-[36%] rounded-full ${t.vinylLabelBg} border-[5px] flex flex-col items-center justify-center p-2 text-center shadow-inner relative`}
                      style={{ borderColor: t.vinylLabelBorderHex }}
                    >
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center select-none pointer-events-none">
                        <span
                          className={`text-[6px] md:text-[7px] font-bold ${t.vinylLabelText} tracking-[0.2em] uppercase origin-center rotate-180`}
                          style={{ writingMode: "vertical-rl" }}
                        >
                          STEREO
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <span
                          className={`text-[6px] md:text-[8px] font-bold tracking-widest ${t.vinylLabelText} uppercase`}
                        >
                          LP - 33 RPM
                        </span>
                        <div className="my-0.5 w-5 h-[1px] bg-current opacity-30" />
                        <span
                          className={`text-[9px] md:text-[11px] font-serif italic ${t.vinylAccentText} font-semibold`}
                        >
                          A &amp; A
                        </span>
                        <span
                          className={`text-[5px] md:text-[7px] ${t.vinylLabelText} font-sans tracking-tight mt-0.5`}
                        >
                          EST. 2023
                        </span>
                      </div>

                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 select-none pointer-events-none text-right">
                        <span
                          className={`text-[5px] font-semibold ${t.vinylLabelText} tracking-tighter block`}
                        >
                          SIDE A
                        </span>
                        <span
                          className={`text-[4px] ${t.vinylLabelText} opacity-70 block`}
                        >
                          VOL. I
                        </span>
                      </div>

                      <div
                        className={`absolute w-4 h-4 rounded-full border ${t.vinylCenterDot} shadow-inner flex items-center justify-center`}
                      />
                    </div>
                  </div>

                  {/* THREE OVERLAID POLAROID IMAGES */}
                  {/* Polaroid 1 (Top Right) */}
                  <div
                    onClick={() => setActivePhotoIndex(0)}
                    className="absolute top-[3%] right-[10%] w-[45%] bg-white p-2.5 pb-6 rounded-[1px] shadow-xl hover:shadow-2xl border border-stone-100 hover:scale-105 hover:rotate-[-5deg] hover:z-30 transition-all duration-300 cursor-pointer select-none rotate-[-3deg]"
                  >
                    <div className="relative aspect-square w-full bg-stone-100 overflow-hidden rounded-sm">
                      <img
                        src={LOVE_STORY_IMAGES[0].url}
                        alt={LOVE_STORY_IMAGES[0].title}
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <div className="mt-2.5 text-center">
                      <span className="font-serif text-[10px] md:text-[11px] text-stone-700 tracking-wide font-semibold block truncate">
                        {LOVE_STORY_IMAGES[0].title}
                      </span>
                      <span className="block text-[7px] text-stone-400 mt-0.5 tracking-wider uppercase font-bold">
                        {LOVE_STORY_IMAGES[0].date}
                      </span>
                    </div>
                  </div>

                  {/* Polaroid 2 (Middle Right) */}
                  <div
                    onClick={() => setActivePhotoIndex(1)}
                    className="absolute top-[31%] right-[1%] w-[45%] bg-white p-2.5 pb-6 rounded-[1px] shadow-xl hover:shadow-2xl border border-stone-100 hover:scale-105 hover:rotate-[4deg] hover:z-30 transition-all duration-300 cursor-pointer select-none rotate-[5deg]"
                  >
                    <div className="relative aspect-square w-full bg-stone-100 overflow-hidden rounded-sm">
                      <img
                        src={LOVE_STORY_IMAGES[1].url}
                        alt={LOVE_STORY_IMAGES[1].title}
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <div className="mt-2.5 text-center">
                      <span className="font-serif text-[10px] md:text-[11px] text-stone-700 tracking-wide font-semibold block truncate">
                        {LOVE_STORY_IMAGES[1].title}
                      </span>
                      <span className="block text-[7px] text-stone-400 mt-0.5 tracking-wider uppercase font-bold">
                        {LOVE_STORY_IMAGES[1].date}
                      </span>
                    </div>
                  </div>

                  {/* Polaroid 3 (Bottom Right) */}
                  <div
                    onClick={() => setActivePhotoIndex(2)}
                    className="absolute bottom-[3%] right-[12%] w-[45%] bg-white p-2.5 pb-6 rounded-[1px] shadow-xl hover:shadow-2xl border border-stone-100 hover:scale-105 hover:rotate-[-3deg] hover:z-30 transition-all duration-300 cursor-pointer select-none rotate-[-2deg]"
                  >
                    <div className="relative aspect-square w-full bg-stone-100 overflow-hidden rounded-sm">
                      <img
                        src={LOVE_STORY_IMAGES[2].url}
                        alt={LOVE_STORY_IMAGES[2].title}
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <div className="mt-2.5 text-center">
                      <span className="font-serif text-[10px] md:text-[11px] text-stone-700 tracking-wide font-semibold block truncate">
                        {LOVE_STORY_IMAGES[2].title}
                      </span>
                      <span className="block text-[7px] text-stone-400 mt-0.5 tracking-wider uppercase font-bold">
                        {LOVE_STORY_IMAGES[2].date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Interactive Story Telling Text panel */}
              <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
                {LOVE_STORY_IMAGES.map((story, i) => (
                  <div
                    key={i}
                    onClick={() => setActivePhotoIndex(i)}
                    className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer group hover:shadow-md ${
                      activePhotoIndex === i
                        ? `${t.cardBg} ${t.border} shadow-sm scale-[1.01]`
                        : "bg-transparent border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm border font-medium ${
                          activePhotoIndex === i
                            ? `${t.accentBg} text-white border-transparent`
                            : `${t.cardBg} ${t.textSecondary} ${t.border} opacity-80`
                        }`}
                      >
                        {i + 1}
                      </span>
                      <h4
                        className={`font-serif text-lg font-semibold tracking-wide ${t.textPrimary}`}
                      >
                        {story.title}
                      </h4>
                      <span
                        className={`text-[10px] ${t.textSecondary} opacity-70 font-semibold uppercase tracking-wider ml-auto`}
                      >
                        {story.date}
                      </span>
                    </div>

                    <p
                      className={`mt-2.5 text-sm leading-relaxed transition-all duration-300 ${
                        activePhotoIndex === i
                          ? `${t.textSecondary}`
                          : `${t.textSecondary} opacity-60 line-clamp-1 group-hover:opacity-100`
                      }`}
                    >
                      {story.desc}
                    </p>
                  </div>
                ))}

                {/* Ambient vinyl hint indicator */}
                <div
                  className={`pt-4 flex items-center gap-3 text-xs ${t.textSecondary} opacity-70 font-serif italic justify-center lg:justify-start`}
                >
                  <Music
                    className={`w-4 h-4 ${isPlaying ? `animate-bounce ${t.accent}` : ""}`}
                  />
                  <span>
                    The vinyl record spins while the invitation music plays!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DETAILS SECTION */}
        <section
          className={`py-24 bg-gradient-to-t ${t.gradient} transition-colors duration-1000 border-t border-b ${t.divider}`}
        >
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span
                className={`text-xs uppercase tracking-[0.3em] ${t.accent} font-semibold`}
              >
                Join Us On Our Big Day
              </span>
              <h2
                className={`text-3xl md:text-5xl font-serif ${t.textPrimary} font-light mt-2`}
              >
                Wedding Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Event card 1 */}
              <div
                className={`${t.cardBg} backdrop-blur-md rounded-2xl p-8 border ${t.border} shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`p-2.5 rounded-lg ${t.badge} border`}>
                      <Calendar className="w-5 h-5" />
                    </span>
                    <h3
                      className={`font-serif text-xl font-bold ${t.textPrimary}`}
                    >
                      Akad
                    </h3>
                  </div>

                  <ul className="space-y-4 font-sans text-sm text-stone-600 dark:text-stone-300">
                    <li className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                      <div>
                        <span
                          className={`font-semibold ${t.textPrimary} block`}
                        >
                          8:00 AM – 9:00 AM
                        </span>
                        <span>
                          Doors close and ceremony begins sharply at 8:00 AM
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                      <div>
                        <span
                          className={`font-semibold ${t.textPrimary} block`}
                        >
                          Graha Tirta Siliwangi
                        </span>
                        <span>Kota Bandung, Indonesia</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-stone-400 italic font-serif">
                    Family Only
                  </span>
                  <a
                    href="https://maps.app.goo.gl/tTptiHqepLYzptnt7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${t.accent} hover:underline`}
                  >
                    View Map <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Event card 2 */}
              <div
                className={`${t.cardBg} backdrop-blur-md rounded-2xl p-8 border ${t.border} shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`p-2.5 rounded-lg ${t.badge} border`}>
                      <Heart className="w-5 h-5" />
                    </span>
                    <h3
                      className={`font-serif text-xl font-bold ${t.textPrimary}`}
                    >
                      Reception
                    </h3>
                  </div>

                  <ul className="space-y-4 font-sans text-sm text-stone-600 dark:text-stone-300">
                    <li className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                      <div>
                        <span
                          className={`font-semibold ${t.textPrimary} block`}
                        >
                          10:00 AM – 2:00 PM
                        </span>
                        <span>
                          Lunch reception immediately following the ceremony,
                          with a musical performance by our dear friends and
                          family.
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                      <div>
                        <span
                          className={`font-semibold ${t.textPrimary} block`}
                        >
                          Graha Tirta Siliwangi
                        </span>
                        <span>Kota Bandung, Indonesia</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-stone-400 italic font-serif">
                    Reception & Live Music
                  </span>
                  <a
                    href="https://calendar.app.google/EjU2PiVzN15LQoMK9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${t.accent} hover:underline`}
                  >
                    Add to Calendar <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GIFT SECTION */}
        <section className={`py-24 px-4 ${t.primaryBg}`}>
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-12">
              <span
                className={`text-xs uppercase tracking-[0.3em] ${t.accent} font-semibold`}
              >
                Wedding Gift
              </span>
              <h2
                className={`text-3xl md:text-5xl font-serif ${t.textPrimary} font-light mt-2 mb-4`}
              >
                Gift of Love
              </h2>
              <p
                className={`${t.textSecondary} text-sm leading-relaxed max-w-md mx-auto`}
              >
                Your presence is the greatest gift of all. Should you wish to
                honour us with a monetary gift, you may transfer to the
                following accounts.
              </p>
            </div>

            {/* Card carousel */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-full flex items-center justify-center gap-3">
                {/* Prev arrow */}
                <button
                  onClick={() => switchCard("prev")}
                  aria-label="Previous account"
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:opacity-80 bg-white/10 backdrop-blur-sm border-white/20 text-white shadow-md"
                  style={{ background: CARD_GRADIENTS[currentThemeKey] }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* VISA Card */}
                <div
                  className="overflow-hidden w-full max-w-sm rounded-2xl"
                  style={{ perspective: "1000px" }}
                >
                  <div
                    key={cardAnimKey}
                    className={`relative rounded-2xl shadow-2xl overflow-hidden select-none ${
                      cardFromRight ? "card-enter-right" : "card-enter-left"
                    }`}
                    style={{
                      background: CARD_GRADIENTS[currentThemeKey],
                      aspectRatio: "1.586 / 1",
                    }}
                  >
                    {/* Background decorative circles */}
                    <div
                      className="absolute -bottom-10 -right-10 w-52 h-52 rounded-full opacity-10"
                      style={{ background: "rgba(255,255,255,0.3)" }}
                    />
                    <div
                      className="absolute -bottom-16 -right-20 w-52 h-52 rounded-full opacity-10"
                      style={{ background: "rgba(255,255,255,0.2)" }}
                    />
                    <div
                      className="absolute top-0 -left-10 w-36 h-36 rounded-full opacity-5"
                      style={{ background: "rgba(255,255,255,0.4)" }}
                    />

                    {/* Card inner layout */}
                    <div className="relative z-10 h-full flex flex-col justify-between p-6">
                      {/* Top row: bank name + contactless */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white/50 text-[9px] uppercase tracking-[0.2em] font-semibold">
                            {GIFT_ACCOUNTS[activeCardIndex].label}
                          </p>
                          <p className="text-white font-bold text-base tracking-widest uppercase font-sans">
                            Bank Mandiri
                          </p>
                        </div>
                        {/* Contactless icon */}
                        <svg
                          viewBox="0 0 24 24"
                          className="w-6 h-6 text-white/40"
                          fill="currentColor"
                        >
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                            opacity=".3"
                          />
                          <path
                            d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                            opacity=".6"
                          />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
                      </div>

                      {/* EMV Chip */}
                      <div className="flex items-center">
                        <div
                          className="relative w-10 h-8 rounded-md overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(135deg, #d4a843 0%, #a8832e 30%, #ffd700 50%, #b8942e 70%, #c9a84c 100%)",
                          }}
                        >
                          {/* Chip lines */}
                          <div className="absolute inset-x-0 top-1/3 h-px bg-yellow-900/30" />
                          <div className="absolute inset-x-0 top-2/3 h-px bg-yellow-900/30" />
                          <div className="absolute inset-y-0 left-1/3 w-px bg-yellow-900/30" />
                          <div className="absolute inset-y-0 left-2/3 w-px bg-yellow-900/30" />
                          <div className="absolute inset-[3px] border border-yellow-700/30 rounded-sm" />
                        </div>
                      </div>

                      {/* Account number */}
                      <div>
                        <p className="font-mono text-white text-lg md:text-xl tracking-[0.18em] font-semibold drop-shadow-sm">
                          {formatAccount(
                            GIFT_ACCOUNTS[activeCardIndex].account,
                          )}
                        </p>
                      </div>

                      {/* Bottom row: a.n. + VISA */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-white/40 text-[9px] uppercase tracking-widest mb-0.5">
                            Account Name
                          </p>
                          <p className="text-white text-xs font-semibold uppercase tracking-wider font-sans">
                            {GIFT_ACCOUNTS[activeCardIndex].name}
                          </p>
                        </div>
                        {/* VISA logotype */}
                        <span
                          className="text-white text-2xl font-black italic"
                          style={{
                            fontFamily: "serif",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          <Heart className="w-5 h-5 inline-block -rotate-6" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next arrow */}
                <button
                  onClick={() => switchCard("next")}
                  aria-label="Next account"
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:opacity-80 bg-white/10 backdrop-blur-sm border-white/20 text-white shadow-md"
                  style={{ background: CARD_GRADIENTS[currentThemeKey] }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Dot indicators */}
              <div className="flex gap-2.5">
                {GIFT_ACCOUNTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCardFromRight(i > activeCardIndex);
                      setCardAnimKey((k) => k + 1);
                      setActiveCardIndex(i);
                    }}
                    aria-label={`Account ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeCardIndex
                        ? `w-6 ${t.accentBg}`
                        : `w-1.5 bg-stone-300`
                    }`}
                  />
                ))}
              </div>

              {/* Copy button */}
              <button
                onClick={() => {
                  const account = GIFT_ACCOUNTS[activeCardIndex].account;
                  navigator.clipboard.writeText(account);
                  setCopiedAccount(account);
                  setTimeout(() => setCopiedAccount(null), 2000);
                }}
                className={`inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-xl border ${t.border} ${t.accent} hover:opacity-80 transition-all duration-200 shadow-sm`}
              >
                {copiedAccount === GIFT_ACCOUNTS[activeCardIndex].account ? (
                  <>
                    <Check className="w-4 h-4" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Account Number
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* RSVP FORM & GUESTBOOK SECTION */}
        <section id="rsvp" className={`py-24 px-4 ${t.primaryBg}`}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: RSVP Form */}
              <div
                className={`lg:col-span-5 ${t.cardBg} p-8 md:p-10 rounded-2xl border ${t.border} shadow-sm relative`}
              >
                <div className="absolute inset-2 border border-stone-200/10 rounded-xl pointer-events-none" />

                <div className="relative z-10">
                  <span
                    className={`text-[10px] uppercase tracking-[0.25em] ${t.accent} font-bold block mb-1`}
                  >
                    Be Our Guest
                  </span>
                  <h3
                    className={`font-serif text-2xl md:text-3xl ${t.textPrimary} font-light mb-6`}
                  >
                    Will You Attend?
                  </h3>

                  {formSubmitted ? (
                    <div className="text-center py-10 animate-in fade-in duration-500">
                      <div
                        className={`w-12 h-12 rounded-full ${t.accentBg} text-white flex items-center justify-center mx-auto mb-4 shadow`}
                      >
                        <Check className="w-6 h-6" />
                      </div>
                      <h4
                        className={`font-serif text-lg font-semibold ${t.textPrimary} mb-2`}
                      >
                        Thank You, {formData.name}!
                      </h4>
                      <p
                        className={`${t.textSecondary} text-sm leading-relaxed mb-6`}
                      >
                        Your response has been registered. We are looking
                        forward to creating memories that will echo throughout
                        our lifetime with you.
                      </p>
                      <button
                        onClick={() => {
                          setFormSubmitted(false);
                          setFormData({
                            name: "",
                            guests: "1",
                            status: "attending",
                            wishes: "",
                          });
                        }}
                        className={`text-xs font-bold ${t.accent} hover:underline uppercase tracking-widest`}
                      >
                        Submit another RSVP
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleRsvpSubmit}
                      className="space-y-5 font-sans"
                    >
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2">
                          Your Name / Family Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="e.g. Mr. & Mrs. Sterling"
                          className="w-full bg-white dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-stone-800 dark:text-stone-100 transition-all duration-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2">
                            No. of Guests
                          </label>
                          <select
                            value={formData.guests}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                guests: e.target.value,
                              })
                            }
                            className="w-full bg-white dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-stone-800 dark:text-stone-100 transition-all duration-300"
                          >
                            <option value="1">1 Person</option>
                            <option value="2">2 Persons</option>
                            <option value="3">3 Persons</option>
                            <option value="4">4 Persons</option>
                            <option value="5">5+ (Family)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2">
                            Attendance
                          </label>
                          <select
                            value={formData.status}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                status: e.target.value,
                              })
                            }
                            className="w-full bg-white dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-stone-800 dark:text-stone-100 transition-all duration-300"
                          >
                            <option value="attending">Happily Attend</option>
                            <option value="maybe">Regretfully Decline</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs uppercase tracking-wider text-stone-400 font-semibold">
                            Wishes / Blessings
                          </label>
                        </div>
                        <textarea
                          rows={3}
                          value={formData.wishes}
                          onChange={(e) =>
                            setFormData({ ...formData, wishes: e.target.value })
                          }
                          placeholder="Share a heartfelt thought or musical song recommendation for the dance..."
                          className="w-full bg-white dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-stone-800 dark:text-stone-100 transition-all duration-300 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className={`w-full py-3.5 px-6 ${t.accentBg} ${t.accentHover} text-white font-semibold text-xs uppercase tracking-[0.2em] rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-[0.98]`}
                      >
                        Submit Response <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Right Column: Dynamic Wishes Wall */}
              <div className="lg:col-span-7 flex flex-col h-full justify-between">
                <div>
                  <span
                    className={`text-[10px] uppercase tracking-[0.25em] ${t.accent} font-bold block mb-1`}
                  >
                    Love Wall
                  </span>
                  <h3
                    className={`font-serif text-3xl ${t.textPrimary} font-light mb-3`}
                  >
                    Wishes & Blessings
                  </h3>
                  <p
                    className={`${t.textSecondary} text-sm leading-relaxed mb-6 font-sans`}
                  >
                    Read the beautiful words and musical messages of love sent
                    by our family and friends across the globe.
                  </p>
                </div>

                {/* Wishes Container */}
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                  {rsvpList.map((wish, index) => (
                    <div
                      key={index}
                      className={`${t.cardBg} p-5 rounded-xl border ${t.border} shadow-sm flex flex-col relative overflow-hidden group hover:shadow transition-all duration-300`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`font-serif text-sm font-semibold ${t.textPrimary}`}
                        >
                          {wish.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                              wish.status === "attending"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-stone-500/10 text-stone-400 border-stone-500/20"
                            }`}
                          >
                            {wish.status === "attending"
                              ? "Attending"
                              : "Declined"}
                          </span>
                          <span className="text-[10px] text-stone-400 font-sans">
                            {wish.timestamp}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`${t.textSecondary} text-xs italic leading-relaxed font-serif pl-3 border-l-2 border-stone-400/30`}
                      >
                        "{wish.message}"
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-stone-200/10 text-[10px] text-stone-400 font-sans flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-500 fill-red-400" />
                  <span>
                    Showing {rsvpList.length} global responses from loved ones
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          className={`py-16 text-center border-t ${t.divider} bg-stone-900 text-stone-300 relative overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none flex justify-center items-center">
            <svg
              className="w-96 h-96 stroke-current fill-none"
              viewBox="0 0 100 100"
            >
              <path
                d="M50 10 C30 30 30 70 50 90 C70 70 70 30 50 10 Z"
                strokeWidth="0.5"
              />
              <path d="M50 10 Q40 40 50 90" strokeWidth="0.2" />
              <path d="M50 30 C45 35 40 40 38 45" strokeWidth="0.3" />
              <path d="M50 50 C55 55 60 60 62 65" strokeWidth="0.3" />
              <path d="M50 70 C45 75 40 80 38 85" strokeWidth="0.3" />
            </svg>
          </div>

          <div className="max-w-md mx-auto relative z-10 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-[0.3em] text-stone-500 font-semibold mb-3">
              Save The Date
            </span>
            <h4 className="text-2xl font-serif text-white tracking-widest leading-normal mb-1 font-light">
              A &amp; A
            </h4>
            <p className="text-xs text-stone-400 font-sans tracking-wide">
              Nov 28th, 2026 • Kota Bandung, Indonesia
            </p>
            <div className="w-12 h-[1px] bg-stone-700 my-6" />
            <p className="text-stone-500 text-[10px] uppercase tracking-widest">
              Crafted with classical adoration and musical memories.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
