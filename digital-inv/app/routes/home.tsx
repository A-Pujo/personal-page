import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Calendar,
  MapPin,
  Music,
  Volume2,
  VolumeX,
  Gift,
  Image as ImageIcon,
  Copy,
  Check,
  Clock,
  Sparkles,
  Send,
  ChevronRight,
  X,
  Compass,
  Users,
  MessageSquare,
  ChevronLeft,
} from "lucide-react";

const THEMES = {
  rose: {
    id: "rose",
    name: "Blushing Rose",
    primary: "text-rose-600",
    primaryBg: "bg-rose-600",
    primaryHover: "hover:bg-rose-700",
    accent: "text-rose-500",
    background: "bg-gradient-to-b from-rose-50 via-white to-rose-50/40",
    cardBg: "bg-white/90 border-rose-100",
    footerBg: "bg-rose-950",
    text: "text-rose-900",
    bodyText: "text-rose-800/80",
    badge: "bg-rose-100 text-rose-800",
    ring: "focus:ring-rose-500",
    divider: "border-rose-100",
    heroOverlay: "bg-rose-950/25",
    pillActive: "bg-rose-600 text-white",
    pillInactive: "bg-rose-50 text-rose-800 hover:bg-rose-100",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Luxury",
    primary: "text-emerald-800",
    primaryBg: "bg-emerald-800",
    primaryHover: "hover:bg-emerald-900",
    accent: "text-amber-600",
    background: "bg-gradient-to-b from-emerald-50/70 via-white to-amber-50/30",
    cardBg: "bg-white/90 border-emerald-100",
    footerBg: "bg-emerald-950",
    text: "text-emerald-950",
    bodyText: "text-emerald-900/80",
    badge: "bg-emerald-100 text-emerald-800",
    ring: "focus:ring-emerald-800",
    divider: "border-emerald-100",
    heroOverlay: "bg-emerald-950/35",
    pillActive: "bg-emerald-800 text-white",
    pillInactive: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  },
  terracotta: {
    id: "terracotta",
    name: "Rustic Terracotta",
    primary: "text-orange-800",
    primaryBg: "bg-orange-800",
    primaryHover: "hover:bg-orange-900",
    accent: "text-orange-700",
    background: "bg-gradient-to-b from-orange-50/60 via-white to-orange-50/20",
    cardBg: "bg-white/90 border-orange-100",
    footerBg: "bg-orange-950",
    text: "text-orange-950",
    bodyText: "text-orange-900/80",
    badge: "bg-orange-100 text-orange-800",
    ring: "focus:ring-orange-800",
    divider: "border-orange-100",
    heroOverlay: "bg-orange-950/30",
    pillActive: "bg-orange-800 text-white",
    pillInactive: "bg-orange-50 text-orange-800 hover:bg-orange-100",
  },
  minimalist: {
    id: "minimalist",
    name: "Modern Charcoal",
    primary: "text-zinc-900",
    primaryBg: "bg-zinc-900",
    primaryHover: "hover:bg-zinc-800",
    accent: "text-zinc-600",
    background: "bg-gradient-to-b from-zinc-100 via-white to-zinc-50",
    cardBg: "bg-white/90 border-zinc-200",
    footerBg: "bg-zinc-950",
    text: "text-zinc-900",
    bodyText: "text-zinc-700",
    badge: "bg-zinc-200 text-zinc-900",
    ring: "focus:ring-zinc-900",
    divider: "border-zinc-200",
    heroOverlay: "bg-zinc-950/40",
    pillActive: "bg-zinc-900 text-white",
    pillInactive: "bg-zinc-100 text-zinc-800 hover:bg-zinc-200",
  },
};

const GALLERY_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    title: "The Pre-Wedding Session",
    category: "Couple",
  },
  {
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    title: "Warm Laughter",
    category: "Candid",
  },
  {
    url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
    title: "Eternity Rings",
    category: "Detail",
  },
  {
    url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80",
    title: "The Magical Feast",
    category: "Venue",
  },
  {
    url: "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&w=800&q=80",
    title: "Sparklers Celebration",
    category: "Party",
  },
  {
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
    title: "First Gentle Kiss",
    category: "Couple",
  },
];

import { weddingData } from "../lib/weddingData";

const IMAGES =
  weddingData.gallery && weddingData.gallery.length
    ? weddingData.gallery
    : GALLERY_IMAGES;

const INITIAL_WISHES = [
  {
    name: "Aunt Clara & Uncle Tom",
    relationship: "Family",
    message:
      "Wishing you both a lifetime of love, laughter, and companionable silence. We cannot wait to celebrate with you!",
    time: "2 hours ago",
  },
  {
    name: "Marcus Sterling",
    relationship: "Best Friend",
    message:
      "Congratulations Jonathan and Sarah! You two truly belong together. Ready to dance the night away!",
    time: "1 day ago",
  },
  {
    name: "Diana Chen",
    relationship: "Colleague",
    message:
      "A beautiful journey is starting! All the best to the gorgeous couple. Cheers!",
    time: "3 days ago",
  },
];

const WEDDING_DATE = new Date("November 24, 2026 8:00:00").getTime();

export default function App() {
  const [activeTheme, setActiveTheme] = useState(THEMES.rose);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [wishes, setWishes] = useState(INITIAL_WISHES);

  // Custom RSVP Form State
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpAttendance, setRsvpAttendance] = useState("yes");
  const [rsvpGuests, setRsvpGuests] = useState("1");
  const [rsvpDiet, setRsvpDiet] = useState("None");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Custom Guestbook Comment Form State
  const [commentName, setCommentName] = useState("");
  const [commentRel, setCommentRel] = useState("Friend");
  const [commentText, setCommentText] = useState("");
  const [recipient, setRecipient] = useState<string | null>(null);
  const [coverVisible, setCoverVisible] = useState(true);
  const [coverFading, setCoverFading] = useState(false);

  // Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = WEDDING_DATE - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const readParam = () => {
      try {
        const p = new URLSearchParams(window.location.search).get("to");
        setRecipient(p && p.length ? p : null);
      } catch {
        setRecipient(null);
      }
    };
    readParam();
    const onPop = () => readParam();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Dismiss cover and start music — this is a user gesture so autoplay is allowed.
  const handleCoverOpen = () => {
    setCoverFading(true);
    setTimeout(() => setCoverVisible(false), 700);
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {});
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e: any) => {
        console.log(
          "Audio autoplay prevented. Standard interactive permission required.",
        );
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleCopyAccount = (acctNumber: string, index: number) => {
    navigator.clipboard.writeText(acctNumber);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    const newWish = {
      name: commentName,
      relationship: commentRel,
      message: commentText,
      time: "Just now",
    };

    setWishes([newWish, ...wishes]);
    setCommentName("");
    setCommentText("");
    setCommentRel("Friend");
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;
    setRsvpSubmitted(true);
  };

  const handlePrevLightbox = () => {
    setLightboxIndex((prev) => {
      if (prev === null) return IMAGES.length - 1;
      return prev === 0 ? IMAGES.length - 1 : prev - 1;
    });
  };

  const handleNextLightbox = () => {
    setLightboxIndex((prev) => {
      if (prev === null) return 0;
      return prev === IMAGES.length - 1 ? 0 : prev + 1;
    });
  };

  return (
    <div
      className={`min-h-screen transition-all duration-700 ease-in-out font-sans ${activeTheme.background} relative overflow-x-hidden pb-12`}
    >
      {/* Cover / Invitation modal */}
      {coverVisible && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center text-center transition-opacity duration-700 ${
            coverFading ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {/* Hero image background */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
          {/* Rose-toned overlay fading to transparent at bottom */}
          <div className="absolute inset-0 bg-rose-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-950/80 via-rose-950/20 to-transparent" />

          <div className="relative z-10 flex flex-col items-center gap-6 px-6">
            <span className="text-amber-300/90 font-serif tracking-[0.3em] uppercase text-xs md:text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 fill-amber-300" /> The Wedding of{" "}
              <Heart className="w-4 h-4 fill-amber-300" />
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-light text-white tracking-wide drop-shadow-md">
              {weddingData.female.nickname} &amp; {weddingData.male.nickname}
            </h1>
            <div className="w-16 h-px bg-amber-400/70 rounded-full" />
            <p className="text-rose-100 font-serif italic text-sm md:text-base max-w-sm">
              December 24, 2026 &bull; Bandung, West Java
            </p>

            <button
              onClick={handleCoverOpen}
              className="mt-6 px-10 py-4 rounded-full bg-rose-600 text-white font-semibold text-sm tracking-widest uppercase shadow-2xl hover:bg-rose-700 active:scale-95 transition-all duration-300 border border-rose-400/40"
            >
              You&apos;re Invited!
            </button>

            <p className="text-rose-200/60 text-[10px] mt-1 font-mono">
              Tap to open your invitation
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Background audio element */}
      <audio
        ref={audioRef}
        src={
          weddingData.audio ||
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
        }
        loop
      />

      {/* Floating Header Actions: Music & Theme Picker */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Theme Picker Dropdown Style */}
        <div className="bg-white/95 shadow-lg border border-zinc-100 backdrop-blur-md rounded-full px-3 py-2 flex items-center gap-1.5 transition-all">
          <Sparkles
            className={`w-4 h-4 ${activeTheme.primary} animate-pulse`}
          />
          <span className="text-xs font-semibold text-zinc-600 mr-1 hidden sm:inline">
            Theme:
          </span>
          <div className="flex gap-1">
            {Object.values(THEMES).map((theme) => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme)}
                className={`w-5 h-5 rounded-full border-2 transition-all transform hover:scale-110 ${
                  activeTheme.id === theme.id
                    ? "border-zinc-800 scale-110 ring-2 ring-white"
                    : "border-zinc-300"
                }`}
                style={{
                  backgroundColor:
                    theme.id === "rose"
                      ? "#fda4af"
                      : theme.id === "emerald"
                        ? "#065f46"
                        : theme.id === "terracotta"
                          ? "#c2410c"
                          : "#27272a",
                }}
                title={theme.name}
              />
            ))}
          </div>
        </div>

        {/* Floating Music Controller */}
        <button
          onClick={togglePlay}
          className={`flex items-center justify-center p-3 rounded-full shadow-lg backdrop-blur-md border text-white transition-all transform hover:scale-105 active:scale-95 duration-300 ${activeTheme.primaryBg} border-white/30`}
          title={isPlaying ? "Mute Background Music" : "Play Background Music"}
        >
          {isPlaying ? (
            <div className="flex items-center gap-1.5 px-1">
              <span className="text-xs font-medium tracking-wide hidden md:inline">
                Mute
              </span>
              <Volume2 className="w-4 h-4 animate-bounce" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-1">
              <span className="text-xs font-medium tracking-wide hidden md:inline">
                Play Music
              </span>
              <VolumeX className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>

      {}
      <section className="relative h-screen w-full flex items-center justify-center text-center overflow-hidden">
        {/* Background Prewedding Hero Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80')`,
          }}
        />
        {/* Stylized Gradient & Tone overlay depending on theme */}
        <div
          className={`absolute inset-0 transition-all duration-700 ${activeTheme.heroOverlay}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/25 to-transparent" />

        <div className="relative z-30 max-w-4xl px-4 flex flex-col items-center justify-center text-white h-full pt-16">
          <span className="text-amber-300/90 font-serif tracking-[0.3em] uppercase text-xs md:text-sm mb-4 animate-fade-in flex items-center gap-2">
            <Heart className="w-4 h-4 fill-amber-300" /> WE ARE GETTING MARRIED{" "}
            <Heart className="w-4 h-4 fill-amber-300" />
          </span>

          <h1 className="text-5xl md:text-8xl font-serif font-light tracking-wide my-4 text-white drop-shadow-md">
            {weddingData.female.nickname} &amp; {weddingData.male.nickname}
          </h1>

          <p className="text-sm md:text-lg font-light max-w-xl text-zinc-100/90 italic tracking-wider font-serif">
            "And now these three remain: faith, hope, and love. But the greatest
            of these is love."
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 border-y border-white/20 py-3 px-6 rounded-lg bg-black/20 backdrop-blur-sm">
            <Calendar className="w-4 h-4 text-amber-300" />
            <span className="text-sm tracking-[0.2em] font-medium font-mono uppercase">
              November 28, 2026 • 08:00 WIB
            </span>
          </div>

          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center gap-3 opacity-95">
            {recipient ? (
              <div className="px-4 py-2 rounded-full bg-white/95 text-zinc-800 shadow-md flex items-center gap-3">
                <span className="text-xs uppercase text-zinc-500">To:</span>
                <span className="font-semibold truncate max-w-xs">
                  {recipient}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 opacity-80 animate-bounce">
                <span className="text-xs font-mono tracking-widest text-zinc-200">
                  SCROLL DOWN
                </span>
                <div className="w-1 h-8 bg-gradient-to-b from-white to-transparent rounded-full" />
              </div>
            )}
          </div>
        </div>
      </section>

      {}
      <section className="relative z-20 max-w-4xl mx-auto -mt-16 px-4">
        <div
          className={`bg-white/95 rounded-2xl shadow-2xl p-6 md:p-10 border transition-all duration-700 ${activeTheme.cardBg} backdrop-blur-xl`}
        >
          <div className="text-center mb-6">
            <span
              className={`text-xs uppercase font-semibold tracking-widest ${activeTheme.primary}`}
            >
              The Big Day Countdown
            </span>
            <h2
              className={`text-2xl md:text-3xl font-serif ${activeTheme.text} mt-1 font-semibold`}
            >
              Counting Every Blessed Second
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-2 md:gap-6">
            <div
              className={`flex flex-col items-center justify-center p-3 md:p-6 rounded-xl border ${activeTheme.divider} bg-zinc-50/50`}
            >
              <span
                className={`text-2xl md:text-5xl font-mono font-bold ${activeTheme.primary}`}
              >
                {timeLeft.days}
              </span>
              <span className="text-[10px] md:text-xs text-zinc-500 uppercase font-semibold tracking-wider mt-1">
                Days
              </span>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-3 md:p-6 rounded-xl border ${activeTheme.divider} bg-zinc-50/50`}
            >
              <span
                className={`text-2xl md:text-5xl font-mono font-bold ${activeTheme.primary}`}
              >
                {timeLeft.hours}
              </span>
              <span className="text-[10px] md:text-xs text-zinc-500 uppercase font-semibold tracking-wider mt-1">
                Hours
              </span>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-3 md:p-6 rounded-xl border ${activeTheme.divider} bg-zinc-50/50`}
            >
              <span
                className={`text-2xl md:text-5xl font-mono font-bold ${activeTheme.primary}`}
              >
                {timeLeft.minutes}
              </span>
              <span className="text-[10px] md:text-xs text-zinc-500 uppercase font-semibold tracking-wider mt-1">
                Minutes
              </span>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-3 md:p-6 rounded-xl border ${activeTheme.divider} bg-zinc-50/50`}
            >
              <span
                className={`text-2xl md:text-5xl font-mono font-bold ${activeTheme.primary}`}
              >
                {timeLeft.seconds}
              </span>
              <span className="text-[10px] md:text-xs text-zinc-500 uppercase font-semibold tracking-wider mt-1">
                Seconds
              </span>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Heart className={`w-8 h-8 mx-auto ${activeTheme.primary} mb-3`} />
          <h2 className={`text-3xl md:text-5xl font-serif ${activeTheme.text}`}>
            The Bride &amp; Groom
          </h2>
          <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-zinc-600 font-serif italic">
            With joyful hearts, we invite you to share in our celebration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Bride Profile Card */}
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <div
                className={`absolute -inset-1.5 bg-gradient-to-r from-amber-200 to-rose-300 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200`}
              />
              <img
                src="https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&q=80&w=600"
                alt={weddingData.female.name}
                className="relative w-48 h-48 md:w-64 md:h-64 object-cover rounded-full border-4 border-white shadow-xl"
              />
            </div>
            <h3
              className={`text-2xl md:text-3xl font-serif mt-6 ${activeTheme.text}`}
            >
              {weddingData.female.name}
            </h3>
            <span
              className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${activeTheme.badge}`}
            >
              The Beautiful Bride
            </span>
            <p className="mt-3 text-sm text-zinc-500 italic font-serif">
              Daughter of {weddingData.female.parent}
            </p>
            <p
              className={`mt-4 max-w-md text-sm ${activeTheme.bodyText} leading-relaxed`}
            >
              "Love is patient and kind. Meeting Jonathan transformed my world
              into an endless horizon of hope, faith, and magical laughter."
            </p>
          </div>

          {/* Groom Profile Card */}
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <div
                className={`absolute -inset-1.5 bg-gradient-to-r from-emerald-200 to-zinc-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200`}
              />
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600"
                alt={weddingData.male.name}
                className="relative w-48 h-48 md:w-64 md:h-64 object-cover rounded-full border-4 border-white shadow-xl"
              />
            </div>
            <h3
              className={`text-2xl md:text-3xl font-serif mt-6 ${activeTheme.text}`}
            >
              {weddingData.male.name}
            </h3>
            <span
              className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${activeTheme.badge}`}
            >
              The Handsome Groom
            </span>
            <p className="mt-3 text-sm text-zinc-500 italic font-serif">
              Son of {weddingData.male.parent}
            </p>
            <p
              className={`mt-4 max-w-md text-sm ${activeTheme.bodyText} leading-relaxed`}
            >
              "Sarah brings out the best within me. Building a beautiful future
              together is my absolute dream come true."
            </p>
          </div>
        </div>
      </section>

      {}
      <section className="py-12 bg-white/40 backdrop-blur-md border-y border-white/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span
              className={`text-xs uppercase font-bold tracking-widest ${activeTheme.primary}`}
            >
              Our Love Story
            </span>
            <h2 className={`text-3xl font-serif mt-1 ${activeTheme.text}`}>
              How It All Began
            </h2>
          </div>

          <div className="relative border-l-2 border-zinc-200/80 ml-4 md:mx-auto md:max-w-2xl">
            {/* Story item 1 */}
            <div className="mb-10 ml-6 md:ml-10 relative">
              <span
                className={`absolute -left-10 md:-left-14 top-1 flex items-center justify-center w-8 h-8 rounded-full bg-white border ${activeTheme.primary}`}
              >
                💖
              </span>
              <span className="text-xs font-mono font-semibold text-zinc-500">
                SEPTEMBER 12, 2021
              </span>
              <h4
                className={`text-lg font-serif font-bold ${activeTheme.text} mt-0.5`}
              >
                First Coincidental Meet
              </h4>
              <p className={`text-sm mt-2 ${activeTheme.bodyText}`}>
                We locked eyes at a local botanical garden café. Jonathan
                spilled coffee on his blueprint, and Sarah, amused, shared her
                sketchbook.
              </p>
            </div>

            {/* Story item 2 */}
            <div className="mb-10 ml-6 md:ml-10 relative">
              <span
                className={`absolute -left-10 md:-left-14 top-1 flex items-center justify-center w-8 h-8 rounded-full bg-white border ${activeTheme.primary}`}
              >
                ✈️
              </span>
              <span className="text-xs font-mono font-semibold text-zinc-500">
                DECEMBER 15, 2023
              </span>
              <h4
                className={`text-lg font-serif font-bold ${activeTheme.text} mt-0.5`}
              >
                The Winter Proposal
              </h4>
              <p className={`text-sm mt-2 ${activeTheme.bodyText}`}>
                Amidst fresh powder snow on the Swiss Alps, Jonathan dropped to
                one knee. With cold fingers and an overflowing warm heart, Sarah
                said Yes!
              </p>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 px-4 max-w-5xl mx-auto" id="location">
        <div className="text-center mb-16">
          <MapPin className={`w-8 h-8 mx-auto ${activeTheme.primary} mb-3`} />
          <h2 className={`text-3xl md:text-5xl font-serif ${activeTheme.text}`}>
            Event Location &amp; Details
          </h2>
          <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Ceremony details */}
          <div
            className={`p-8 rounded-2xl border bg-white shadow-xl transition-all duration-500 hover:shadow-2xl flex flex-col justify-between ${activeTheme.cardBg}`}
          >
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest ${activeTheme.badge} mb-4`}
              >
                Holy Matrimony
              </span>
              <h3 className={`text-2xl font-serif ${activeTheme.text} mb-4`}>
                The Solemn Vows
              </h3>

              <div className="space-y-4 text-sm text-zinc-600">
                <div className="flex items-start gap-3">
                  <Clock
                    className={`w-5 h-5 ${activeTheme.primary} mt-0.5 flex-shrink-0`}
                  />
                  <div>
                    <p className="font-semibold text-zinc-900">
                      16:00 PM - 17:30 PM
                    </p>
                    <p className="text-xs text-zinc-500">
                      Thursday, December 24, 2026
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin
                    className={`w-5 h-5 ${activeTheme.primary} mt-0.5 flex-shrink-0`}
                  />
                  <div>
                    <p className="font-semibold text-zinc-900">
                      St. Mary’s Cathedral Basilica
                    </p>
                    <p className="text-xs text-zinc-500">
                      254 Cathedral Hill Pkwy, San Francisco, CA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl transition-all font-medium text-sm text-white shadow-md ${activeTheme.primaryBg} ${activeTheme.primaryHover}`}
              >
                <Compass className="w-4 h-4" /> View Holy Matrimony Map
              </a>
            </div>
          </div>

          {/* Dinner Reception details */}
          <div
            className={`p-8 rounded-2xl border bg-white shadow-xl transition-all duration-500 hover:shadow-2xl flex flex-col justify-between ${activeTheme.cardBg}`}
          >
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest ${activeTheme.badge} mb-4`}
              >
                The Celebration
              </span>
              <h3 className={`text-2xl font-serif ${activeTheme.text} mb-4`}>
                Reception
              </h3>

              <div className="space-y-4 text-sm text-zinc-600">
                <div className="flex items-start gap-3">
                  <Clock
                    className={`w-5 h-5 ${activeTheme.primary} mt-0.5 flex-shrink-0`}
                  />
                  <div>
                    <p className="font-semibold text-zinc-900">
                      18:30 PM - Late Night
                    </p>
                    <p className="text-xs text-zinc-500">
                      Thursday, December 24, 2026
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin
                    className={`w-5 h-5 ${activeTheme.primary} mt-0.5 flex-shrink-0`}
                  />
                  <div>
                    <p className="font-semibold text-zinc-900">
                      The Glass Palace Mansion
                    </p>
                    <p className="text-xs text-zinc-500">
                      77 Sunset Boulevard Way, San Francisco, CA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl transition-all font-medium text-sm text-white shadow-md ${activeTheme.primaryBg} ${activeTheme.primaryHover}`}
              >
                <Compass className="w-4 h-4" /> View Reception Venue Map
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic Map Mock Illustration */}
        <div className="mt-12 rounded-2xl overflow-hidden border border-zinc-200 shadow-lg relative h-64 bg-zinc-100">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center justify-center text-center p-6">
            <div
              className={`w-12 h-12 rounded-full ${activeTheme.primaryBg} text-white flex items-center justify-center shadow-lg animate-bounce mb-3`}
            >
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="text-zinc-800 font-bold font-serif">
              Interactive Directions Map
            </h4>
            <p className="text-xs text-zinc-500 max-w-md mt-1">
              Both locations are strategically placed 15 minutes apart. Shuttles
              are fully organized starting immediately after the mass.
            </p>
            <div className="mt-4 flex gap-3 text-xs">
              <span className="px-3 py-1 bg-white border border-zinc-200 rounded-full font-medium shadow-sm">
                📍 Cathedral Matrimony
              </span>
              <span className="px-3 py-1 bg-white border border-zinc-200 rounded-full font-medium shadow-sm">
                📍 Palace Reception
              </span>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-zinc-50/50 border-y border-zinc-200/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <ImageIcon
              className={`w-8 h-8 mx-auto ${activeTheme.primary} mb-3`}
            />
            <h2
              className={`text-3xl md:text-5xl font-serif ${activeTheme.text}`}
            >
              Sweet Moments Gallery
            </h2>
            <p className="mt-3 text-sm text-zinc-500 tracking-wider">
              PRE-WEDDING PORTRAIT DIARY
            </p>
            <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-4 rounded-full" />
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {IMAGES.map((img, index) => (
              <div
                key={index}
                onClick={() => setLightboxIndex(index)}
                className="group relative h-80 rounded-2xl overflow-hidden shadow-md cursor-zoom-in transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-xs text-amber-300 font-mono tracking-widest uppercase mb-1">
                    {img.category}
                  </span>
                  <h4 className="text-white text-lg font-serif">{img.title}</h4>
                  <p className="text-xs text-zinc-300 mt-1 flex items-center gap-1">
                    Click to enlarge <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handlePrevLightbox}
            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="max-w-4xl max-h-[80vh] flex flex-col items-center">
            <img
              src={IMAGES[lightboxIndex].url}
              alt={IMAGES[lightboxIndex].title}
              className="max-w-full max-h-[70vh] rounded-lg object-contain border border-white/20"
            />
            <div className="text-center mt-4">
              <span className="text-xs text-amber-300 font-mono uppercase tracking-widest">
                {IMAGES[lightboxIndex].category}
              </span>
              <h4 className="text-white text-xl font-serif mt-1">
                {IMAGES[lightboxIndex].title}
              </h4>
            </div>
          </div>

          <button
            onClick={handleNextLightbox}
            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <Gift className={`w-8 h-8 mx-auto ${activeTheme.primary} mb-3`} />
          <h2 className={`text-3xl md:text-5xl font-serif ${activeTheme.text}`}>
            Wedding Gifts &amp; Blessings
          </h2>
          <p className="mt-3 text-sm text-zinc-500">
            For those who wish to express their blessings through wedding gifts
          </p>
          <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Bank Transfer 1 */}
          <div
            className={`p-8 rounded-2xl border bg-white shadow-xl transition-all duration-500 relative overflow-hidden ${activeTheme.cardBg}`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold tracking-widest uppercase text-zinc-400">
                CHASE WEALTH BANK
              </span>
              <span
                className={`px-2 py-1 rounded text-[10px] font-bold ${activeTheme.badge}`}
              >
                PRIMARY
              </span>
            </div>

            <p className="text-xs text-zinc-400 uppercase tracking-wider">
              Account Number
            </p>
            <h4 className="text-2xl font-mono font-bold text-zinc-800 tracking-wider my-1">
              9874 - 2311 - 8540
            </h4>

            <p className="text-xs text-zinc-400 uppercase tracking-wider mt-4">
              Account Holder Name
            </p>
            <p className="font-serif font-semibold text-zinc-700">
              Sarah Avery
            </p>

            <button
              onClick={() => handleCopyAccount("9874-2311-8540", 1)}
              className={`mt-6 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                copiedIndex === 1
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
              }`}
            >
              {copiedIndex === 1 ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" /> Copied
                  Successfully!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Account Number
                </>
              )}
            </button>
          </div>

          {/* Bank Transfer 2 */}
          <div
            className={`p-8 rounded-2xl border bg-white shadow-xl transition-all duration-500 relative overflow-hidden ${activeTheme.cardBg}`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold tracking-widest uppercase text-zinc-400">
                CITIZENS ALLIANCE BANK
              </span>
              <span
                className={`px-2 py-1 rounded text-[10px] font-bold ${activeTheme.badge}`}
              >
                SECONDARY
              </span>
            </div>

            <p className="text-xs text-zinc-400 uppercase tracking-wider">
              Account Number
            </p>
            <h4 className="text-2xl font-mono font-bold text-zinc-800 tracking-wider my-1">
              4520 - 9081 - 7721
            </h4>

            <p className="text-xs text-zinc-400 uppercase tracking-wider mt-4">
              Account Holder Name
            </p>
            <p className="font-serif font-semibold text-zinc-700">
              Jonathan Sterling
            </p>

            <button
              onClick={() => handleCopyAccount("4520-9081-7721", 2)}
              className={`mt-6 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                copiedIndex === 2
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
              }`}
            >
              {copiedIndex === 2 ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" /> Copied
                  Successfully!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Account Number
                </>
              )}
            </button>
          </div>
        </div>

        {/* Physical Gift Mailing Address */}
        <div
          className={`mt-10 p-8 rounded-2xl border bg-white shadow-xl max-w-4xl mx-auto ${activeTheme.cardBg} text-center`}
        >
          <MapPin className={`w-6 h-6 mx-auto ${activeTheme.primary} mb-2`} />
          <h4 className={`text-xl font-serif ${activeTheme.text} mb-2`}>
            Mailing Gift Parcels
          </h4>
          <p className="text-sm text-zinc-500 max-w-lg mx-auto">
            If you wish to send physical gifts or beautiful flower bouquets
            directly to the couple, please route them to the shared apartment
            residence below:
          </p>
          <p className="mt-4 font-semibold text-zinc-800 italic text-sm">
            {weddingData.location.address}
          </p>

          <button
            onClick={() =>
              handleCopyAddress(
                "Apartment Unit 402B, Rosewood Terraces, Sunset Boulevard Avenue, CA 94101",
              )
            }
            className={`mt-4 inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              copiedAddress
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
            }`}
          >
            {copiedAddress ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" /> Copied Address!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Shared Residence Address
              </>
            )}
          </button>
        </div>
      </section>

      {}
      <section className="py-20 bg-white/45 backdrop-blur-md border-y border-zinc-200/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <Users className={`w-8 h-8 mx-auto ${activeTheme.primary} mb-3`} />
            <h2
              className={`text-3xl md:text-5xl font-serif ${activeTheme.text}`}
            >
              RSVP Attendance
            </h2>
            <p className="mt-3 text-sm text-zinc-500">
              Kindly seal your presence before December 1, 2026
            </p>
            <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-4 rounded-full" />
          </div>

          <div
            className={`p-8 md:p-12 rounded-2xl shadow-xl bg-white border max-w-2xl mx-auto ${activeTheme.cardBg}`}
          >
            {rsvpSubmitted ? (
              <div className="text-center py-10">
                <div
                  className={`w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4`}
                >
                  <Check className="w-8 h-8" />
                </div>
                <h4
                  className={`text-2xl font-serif ${activeTheme.text} font-bold`}
                >
                  RSVP Registered!
                </h4>
                <p className="text-zinc-500 text-sm mt-2 max-w-sm mx-auto">
                  Thank you so much! Your attendance choice has been simulated
                  and stored successfully. We cannot wait to see you there!
                </p>
                <button
                  onClick={() => {
                    setRsvpSubmitted(false);
                    setRsvpName("");
                    setRsvpMessage("");
                  }}
                  className={`mt-6 inline-flex text-xs font-bold underline cursor-pointer text-zinc-600 hover:${activeTheme.primary}`}
                >
                  Edit or Submit Another RSVP
                </button>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amanda Parker"
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:outline-none focus:ring-2 focus:bg-white transition-all ${activeTheme.ring}`}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                      Will you attend?
                    </label>
                    <select
                      value={rsvpAttendance}
                      onChange={(e) => setRsvpAttendance(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:outline-none focus:ring-2 focus:bg-white transition-all ${activeTheme.ring}`}
                    >
                      <option value="yes">Yes, with pleasure!</option>
                      <option value="no">Apologies, cannot make it</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                      Number of Guests
                    </label>
                    <select
                      value={rsvpGuests}
                      onChange={(e) => setRsvpGuests(e.target.value)}
                      disabled={rsvpAttendance === "no"}
                      className={`w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-50 ${activeTheme.ring}`}
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 Persons (Couple)</option>
                      <option value="3">3 Persons (With Family)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Dietary Requirements (Optional)
                  </label>
                  <select
                    value={rsvpDiet}
                    onChange={(e) => setRsvpDiet(e.target.value)}
                    disabled={rsvpAttendance === "no"}
                    className={`w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-50 ${activeTheme.ring}`}
                  >
                    <option value="None">No Preference (General Buffet)</option>
                    <option value="Vegetarian">Vegetarian Delight</option>
                    <option value="GlutenFree">Gluten-Free Only</option>
                    <option value="Halal">Halal Feast</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Warm Words / Blessings
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Leave a short romantic message for us..."
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:outline-none focus:ring-2 focus:bg-white transition-all ${activeTheme.ring}`}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-4 rounded-xl text-white font-semibold text-sm transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2 ${activeTheme.primaryBg} ${activeTheme.primaryHover}`}
                >
                  <Send className="w-4 h-4" /> Send RSVP Response
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <MessageSquare
            className={`w-8 h-8 mx-auto ${activeTheme.primary} mb-3`}
          />
          <h2 className={`text-3xl md:text-5xl font-serif ${activeTheme.text}`}>
            Virtual Guest Book
          </h2>
          <p className="mt-3 text-sm text-zinc-500">
            Send your heartwarming wishes to the newly-weds
          </p>
          <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Post Wish Form */}
          <div
            className={`md:col-span-2 p-6 rounded-2xl bg-white border shadow-md h-fit ${activeTheme.cardBg}`}
          >
            <h4
              className={`text-lg font-serif ${activeTheme.text} mb-4 font-bold`}
            >
              Post a Greeting
            </h4>
            <form onSubmit={handleAddWish} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-500 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clara Avery"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm border border-zinc-200 focus:outline-none focus:ring-2 ${activeTheme.ring}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-500 mb-1">
                  Relationship
                </label>
                <select
                  value={commentRel}
                  onChange={(e) => setCommentRel(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm border border-zinc-200 focus:outline-none focus:ring-2 ${activeTheme.ring}`}
                >
                  <option value="Friend">Friend</option>
                  <option value="Family">Family</option>
                  <option value="Colleague">Colleague</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-500 mb-1">
                  Greeting Message
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write congratulations..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm border border-zinc-200 focus:outline-none focus:ring-2 ${activeTheme.ring}`}
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-lg text-white font-medium text-xs transition-all uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 ${activeTheme.primaryBg} ${activeTheme.primaryHover}`}
              >
                Post Wish <Send className="w-3 h-3" />
              </button>
            </form>
          </div>

          {/* Wishes List */}
          <div className="md:col-span-3 space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
            {wishes.map((wish, index) => (
              <div
                key={index}
                className={`p-5 rounded-xl border bg-white/70 shadow-sm transition-all duration-300 hover:shadow-md ${activeTheme.cardBg}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5
                    className={`font-serif font-bold text-sm ${activeTheme.text}`}
                  >
                    {wish.name}
                  </h5>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${activeTheme.badge}`}
                  >
                    {wish.relationship}
                  </span>
                </div>
                <p className="text-zinc-600 text-xs leading-relaxed italic">
                  "{wish.message}"
                </p>
                <p className="text-[10px] text-zinc-400 font-mono mt-3 text-right">
                  {wish.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <footer
        className={`${activeTheme.footerBg} text-white py-16 text-center transition-colors duration-700`}
      >
        <div className="max-w-4xl mx-auto px-4">
          <Heart className="w-10 h-10 fill-amber-300 text-amber-300 mx-auto animate-pulse mb-4" />
          <h2 className="text-3xl md:text-5xl font-serif font-light tracking-wide text-white">
            {weddingData.female.name} &amp; {weddingData.male.name}
          </h2>
          <p className="text-xs text-zinc-400 mt-2 uppercase tracking-[0.3em] font-mono">
            We Look Forward to Welcoming You
          </p>

          <div className="w-24 h-px bg-white/20 mx-auto my-8" />

          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Please make sure to review final timings. Thank you for being a
            wonderful and treasured part of our life story.
          </p>
          <p className="text-[10px] text-zinc-500 mt-8 font-mono">
            © 2026 {weddingData.female.name} &amp; {weddingData.male.name}.
            Beautifully handcrafted for wedding celebrations.
          </p>
        </div>
      </footer>
    </div>
  );
}
