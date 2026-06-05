import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router";
import type { LucideIcon } from "lucide-react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, useTexture } from "@react-three/drei";
import {
  Heart,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  Check,
  Copy,
  Volume2,
  VolumeX,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────
type SceneState = { section: number; scroll: number };

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
  bg: "#020d1f",
  bgAlt: "#040f26",
  card: "#0a1628",
  gold: "#c9a84c",
  ivory: "#e8e0d0",
  muted: "#8ea0be",
  border: "rgba(201,168,76,0.18)",
  divider: "rgba(201,168,76,0.07)",
} as const;

// ─── Countdown ────────────────────────────────────────────────────────────────
const TARGET = new Date("Nov 28, 2026 10:00:00").getTime();

function useCountdown() {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      const diff = TARGET - Date.now();
      if (diff <= 0) return void clearInterval(id);
      setT({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// ─── 3D: Vinyl disc texture (moon image) ────────────────────────────────────
function useVinylTexture() {
  const tex = useTexture("/media/gallery/vinyl-moon.png");
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ─── 3D: Vinyl Record ─────────────────────────────────────────────────────────
function VinylRecord({
  spinning,
  sceneState,
}: {
  spinning: boolean;
  sceneState: React.MutableRefObject<SceneState>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useVinylTexture();

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const section = sceneState.current.section;
    // Slower in RSVP section (5), fully stopped when not playing
    const speed = !spinning ? 0 : section === 5 ? 0.1 : 0.42;
    groupRef.current.rotation.y += dt * speed;
  });

  return (
    <Float speed={0.85} rotationIntensity={0.04} floatIntensity={0.18}>
      <group ref={groupRef} rotation={[0.1, 0.1, 0.05]}>
        {/* Top face – canvas texture */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.043, 0]}>
          <circleGeometry args={[2.5, 64]} />
          <meshStandardMaterial map={tex} roughness={0.12} metalness={0.35} />
        </mesh>

        {/* Edge (open cylinder) */}
        <mesh>
          <cylinderGeometry args={[2.5, 2.5, 0.086, 64, 1, true]} />
          <meshStandardMaterial
            color="#0a1628"
            roughness={0.22}
            metalness={0.78}
          />
        </mesh>

        {/* Bottom face */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.043, 0]}>
          <circleGeometry args={[2.5, 64]} />
          <meshStandardMaterial
            color="#060c18"
            roughness={0.88}
            metalness={0.12}
          />
        </mesh>
      </group>
    </Float>
  );
}

// ─── 3D: Gold Dust Particles ──────────────────────────────────────────────────
function GoldDust() {
  const count = 180;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 20;
      pos[i + 1] = (Math.random() - 0.5) * 11;
      pos[i + 2] = (Math.random() - 0.5) * 15 - 5;
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.016;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color="#c9a84c"
        size={0.045}
        transparent={true}
        opacity={0.52}
      />
    </points>
  );
}

// ─── 3D: Gold Glow Ring (pulses in countdown section) ────────────────────────
function GlowRing({
  sceneState,
}: {
  sceneState: React.MutableRefObject<SceneState>;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, dt) => {
    if (!ref.current) return;
    t.current += dt;
    const active = sceneState.current.section === 3;
    const pulse = 1 + Math.sin(t.current * 2.6) * 0.07;
    const targetScale = active ? pulse : 0.001;
    const targetOpacity = active ? 0.3 + Math.sin(t.current * 2.6) * 0.14 : 0;
    ref.current.scale.setScalar(
      THREE.MathUtils.lerp(ref.current.scale.x, targetScale, 0.055),
    );
    (ref.current.material as THREE.MeshBasicMaterial).opacity =
      THREE.MathUtils.lerp(
        (ref.current.material as THREE.MeshBasicMaterial).opacity,
        targetOpacity,
        0.055,
      );
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} scale={0.001}>
      <ringGeometry args={[2.65, 3.3, 64]} />
      <meshBasicMaterial
        color="#c9a84c"
        transparent={true}
        opacity={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── 3D: Camera Parallax (section-aware) ──────────────────────────────────────
function CameraRig({
  sceneState,
}: {
  sceneState: React.MutableRefObject<SceneState>;
}) {
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 2.2, z: 7.5 });

  // Target camera position per section
  const CAMS = [
    { x: 0.0, y: 2.2, z: 7.5 }, // 0: hero
    { x: 0.0, y: 4.0, z: 6.5 }, // 1: couple — elevated / top-down
    { x: -1.2, y: 2.8, z: 8.0 }, // 2: love story — offset left, open
    { x: 1.5, y: 3.0, z: 7.0 }, // 3: countdown — slight side offset
    { x: 0.0, y: 1.5, z: 10.0 }, // 4: details — pulled back
    { x: -1.0, y: 2.5, z: 7.0 }, // 5: RSVP — slight left
  ];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  useFrame((state) => {
    const s = Math.min(sceneState.current.section, CAMS.length - 1);
    const cam = CAMS[s];
    target.current.x = THREE.MathUtils.lerp(
      target.current.x,
      cam.x + mouse.current.x * 0.4,
      0.028,
    );
    target.current.y = THREE.MathUtils.lerp(
      target.current.y,
      cam.y + mouse.current.y * 0.22,
      0.028,
    );
    target.current.z = THREE.MathUtils.lerp(target.current.z, cam.z, 0.028);
    state.camera.position.set(
      target.current.x,
      target.current.y,
      target.current.z,
    );
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── 3D: Full Scene ───────────────────────────────────────────────────────────
function Scene({
  spinning,
  sceneState,
}: {
  spinning: boolean;
  sceneState: React.MutableRefObject<SceneState>;
}) {
  return (
    <>
      <color attach="background" args={["#020d1f"]} />
      <fog attach="fog" args={["#020d1f", 15, 34]} />

      {/* Lighting */}
      <ambientLight color="#1a2a4a" intensity={0.95} />
      <pointLight position={[5, 6, 5]} color="#f0c060" intensity={70} />
      <pointLight position={[-4, 2, 3]} color="#4488cc" intensity={24} />
      <pointLight position={[0, -2, 3]} color="#1a2855" intensity={14} />

      {/* Starfield background */}
      <Stars
        radius={80}
        depth={50}
        count={3200}
        factor={3}
        saturation={0.12}
        fade={true}
        speed={0.35}
      />

      {/* Scene elements */}
      <GoldDust />
      <VinylRecord spinning={spinning} sceneState={sceneState} />
      <GlowRing sceneState={sceneState} />
      <CameraRig sceneState={sceneState} />
    </>
  );
}

// ─── UI: Portrait Card ───────────────────────────────────────────────────────
function CoupleCard({
  role,
  name,
  sub,
  img,
}: {
  role: string;
  name: string;
  sub: string;
  img: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const onTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(700px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) scale(1.03)`;
  };

  const onReset = () => {
    if (cardRef.current)
      cardRef.current.style.transform =
        "perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  const corners: React.CSSProperties[] = [
    {
      top: "5px",
      left: "5px",
      borderTop: `2px solid ${C.gold}50`,
      borderLeft: `2px solid ${C.gold}50`,
    },
    {
      top: "5px",
      right: "5px",
      borderTop: `2px solid ${C.gold}50`,
      borderRight: `2px solid ${C.gold}50`,
    },
    {
      bottom: "5px",
      left: "5px",
      borderBottom: `2px solid ${C.gold}50`,
      borderLeft: `2px solid ${C.gold}50`,
    },
    {
      bottom: "5px",
      right: "5px",
      borderBottom: `2px solid ${C.gold}50`,
      borderRight: `2px solid ${C.gold}50`,
    },
  ];

  return (
    <div
      ref={cardRef}
      className="flex flex-col items-center text-center gap-5"
      style={{
        transition: "transform 0.4s ease",
        transformStyle: "preserve-3d",
      }}
      onMouseMove={onTilt}
      onMouseLeave={onReset}
    >
      {/* Portrait frame */}
      <div
        className="relative"
        style={{
          padding: "12px",
          background: C.card,
          border: `1px solid ${C.border}`,
          boxShadow: "0 14px 50px rgba(0,0,0,0.65)",
        }}
      >
        {corners.map((s, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              width: "16px",
              height: "16px",
              ...s,
            }}
          />
        ))}
        <div className="w-48 h-64 overflow-hidden">
          <img
            src={img}
            alt={name}
            className="w-full h-full object-cover transition-all duration-700"
            style={{ filter: "grayscale(35%)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.filter = "grayscale(0%)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.filter = "grayscale(35%)")
            }
          />
        </div>
      </div>

      <div>
        <p
          className="text-[10px] uppercase tracking-[0.3em] mb-2"
          style={{ color: C.gold }}
        >
          {role}
        </p>
        <h3
          className="font-serif text-lg font-semibold tracking-wider mb-2"
          style={{ color: C.ivory }}
        >
          {name}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: C.muted, whiteSpace: "pre-line" }}
        >
          {sub}
        </p>
      </div>
    </div>
  );
}

// ─── UI: Event Card ──────────────────────────────────────────────────────────
function EventCard({
  title,
  Icon,
  time,
  venue,
  address,
  note,
  link,
}: {
  title: string;
  Icon: LucideIcon;
  time: string;
  venue: string;
  address: string;
  note: string;
  link: string;
}) {
  return (
    <div
      className="rounded-2xl p-8 flex flex-col justify-between"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span
            className="p-2 rounded-lg"
            style={{
              background: `${C.gold}12`,
              border: `1px solid ${C.gold}22`,
            }}
          >
            <Icon className="w-[18px] h-[18px]" style={{ color: C.gold }} />
          </span>
          <h3
            className="font-serif text-lg font-semibold"
            style={{ color: C.ivory }}
          >
            {title}
          </h3>
        </div>

        <ul className="space-y-3 text-sm" style={{ color: C.muted }}>
          <li className="flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-60" />
            <span>{time}</span>
          </li>
          <li className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-60" />
            <div>
              <span style={{ color: C.ivory }}>{venue}</span>
              <br />
              {address}
            </div>
          </li>
        </ul>
      </div>

      <div
        className="mt-6 pt-4 flex justify-between items-center"
        style={{ borderTop: `1px solid ${C.divider}` }}
      >
        <span className="text-xs italic" style={{ color: C.muted }}>
          {note}
        </span>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-semibold hover:opacity-75 transition-opacity"
          style={{ color: C.gold }}
        >
          View <ChevronRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// ─── UI: Flip Countdown Tile ─────────────────────────────────────────────────
function FlipTile({ label, val }: { label: string; val: number }) {
  const [animKey, setAnimKey] = useState(0);
  const prevRef = useRef(val);

  useEffect(() => {
    if (val !== prevRef.current) {
      prevRef.current = val;
      setAnimKey((k) => k + 1);
    }
  }, [val]);

  return (
    <div
      className="rounded-xl py-5 overflow-hidden"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <p
        key={animKey}
        className="font-serif font-light text-3xl leading-none"
        style={{
          color: C.gold,
          animation:
            animKey > 0
              ? "countFlip 0.38s cubic-bezier(.22,.68,0,1.2)"
              : "none",
        }}
      >
        {String(val).padStart(2, "0")}
      </p>
      <p
        className="text-[9px] uppercase tracking-widest mt-2"
        style={{ color: C.muted }}
      >
        {label}
      </p>
    </div>
  );
}

// ─── UI: Gold Confetti Burst ──────────────────────────────────────────────────
function Confetti({ active, onDone }: { active: boolean; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#c9a84c", "#f2d872", "#d4b876", "#e8e0d0", "#b8a060"];
    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      r: number;
      color: string;
      rot: number;
      vrot: number;
    };
    const pts: P[] = Array.from({ length: 90 }, () => {
      const angle = -(Math.PI * 0.2 + Math.random() * Math.PI * 0.6);
      const speed = 4 + Math.random() * 11;
      return {
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 180,
        y: canvas.height * 0.62,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        r: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.22,
      };
    });

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28;
        p.vx *= 0.99;
        p.rot += p.vrot;
        p.alpha -= 0.011;
        if (p.alpha <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r * 0.45, p.r * 2, p.r); // thin rectangle
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (alive) raf = requestAnimationFrame(draw);
      else onDone();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, onDone]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Gift Accounts Data ──────────────────────────────────────────
const GIFT_ACCOUNTS = [
  {
    label: "Groom's Account",
    bank: "Bank Mandiri",
    account: "1410023266968",
    name: "Aln Pujo Priambodo",
  },
  {
    label: "Bride's Account",
    bank: "Bank Mandiri",
    account: "1230010940908",
    name: "Alfiana Yuniarianti",
  },
];

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #0f2446 0%, #1a3460 40%, #0c1c3c 100%)",
  "linear-gradient(135deg, #28123a 0%, #1c0c2e 40%, #211038 100%)",
];

function formatAccount(acc: string) {
  return acc.replace(/.{4}(?=.)/g, "$& ");
}

// ─── Love Story Data ──────────────────────────────────────────────────────────
const LOVE_STORY = [
  {
    title: "First Meeting",
    date: "2023",
    desc: "Two strangers drawn together by a shared love of music. What started as a conversation about The Beatles became the beginning of everything.",
    url: "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    title: "Growing Closer",
    date: "2024",
    desc: "Long evenings, longer conversations — discovering that every song sounds more beautiful when you have someone to hum along with.",
    url: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    title: "The Promise",
    date: "2025",
    desc: "Under a canopy of stars, with Here, There and Everywhere playing softly in the background — the answer was yes, long before the question was asked.",
    url: "https://images.pexels.com/photos/1030914/pexels-photo-1030914.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];

// ─── Guestbook persistence ────────────────────────────────────────────────────
const GUESTBOOK_KEY = "wedding-guestbook-v1";
type GuestEntry = { name: string; status: string; message: string };
const GUESTBOOK_DEFAULTS: GuestEntry[] = [
  {
    name: "Budi & Ani",
    status: "attending",
    message: "Semoga selalu bahagia dan diberkahi!",
  },
  {
    name: "Nenek Siti",
    status: "attending",
    message: "Doa kami selalu menyertai kalian berdua.",
  },
  {
    name: "Reza & Dina",
    status: "maybe",
    message: "Insya Allah hadir, selamat ya!",
  },
];

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function Home3DNew() {
  const [isOpened, setIsOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    status: "attending",
    wishes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [guestbook, setGuestbook] = useState<GuestEntry[]>(GUESTBOOK_DEFAULTS);

  const countdown = useCountdown();
  const audioRef = useRef<HTMLAudioElement>(null);
  // Shared scene state — read by CameraRig + GlowRing via ref (no re-renders on scroll)
  const sceneStateRef = useRef<SceneState>({ section: 0, scroll: 0 });
  const [confettiActive, setConfettiActive] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cardAnimKey, setCardAnimKey] = useState(0);
  const [cardFromRight, setCardFromRight] = useState(true);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const toName = searchParams.get("to");

  const switchCard = (dir: "prev" | "next") => {
    setCardFromRight(dir === "next");
    setCardAnimKey((k) => k + 1);
    setActiveCardIndex((i) =>
      dir === "next"
        ? (i + 1) % GIFT_ACCOUNTS.length
        : (i - 1 + GIFT_ACCOUNTS.length) % GIFT_ACCOUNTS.length,
    );
  };

  useEffect(() => setMounted(true), []);

  // Hydrate guestbook from localStorage (user-submitted entries only)
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(GUESTBOOK_KEY) ?? "[]",
      ) as GuestEntry[];
      if (Array.isArray(saved) && saved.length > 0) {
        setGuestbook([...saved, ...GUESTBOOK_DEFAULTS]);
      }
    } catch {
      // corrupt storage — leave defaults intact
    }
  }, []);

  // Scroll progress tracking (no re-renders)
  useEffect(() => {
    const h = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      sceneStateRef.current.scroll = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Section tracking via IntersectionObserver — updates camera + glow ring
  useEffect(() => {
    if (!isOpened) return;
    const els = document.querySelectorAll("[data-section]");
    const obs = new IntersectionObserver(
      (entries) => {
        let best = -1,
          bestRatio = 0;
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > bestRatio) {
            bestRatio = e.intersectionRatio;
            best = parseInt(e.target.getAttribute("data-section") ?? "0");
          }
        });
        if (best >= 0) sceneStateRef.current.section = best;
      },
      { threshold: [0.1, 0.3, 0.5, 0.7] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [isOpened]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const handleOpen = () => {
    setIsOpened(true);
    setTimeout(() => {
      audioRef.current
        ?.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }, 500);
  };

  const handleRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const entry: GuestEntry = {
      name: formData.name,
      status: formData.status,
      message: formData.wishes || "Selamat dan bahagia selalu!",
    };
    setGuestbook((prev) => [entry, ...prev]);
    // Persist user-submitted entries to localStorage
    try {
      const saved = JSON.parse(
        localStorage.getItem(GUESTBOOK_KEY) ?? "[]",
      ) as GuestEntry[];
      localStorage.setItem(GUESTBOOK_KEY, JSON.stringify([entry, ...saved]));
    } catch {
      // storage unavailable — in-memory only
    }
    setSubmitted(true);
    setConfettiActive(true);
  };

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ background: C.bg, color: C.ivory }}
    >
      {/* Flip animation keyframe for countdown tiles + vinyl spin */}
      <style>{`
        @keyframes countFlip {
          0%   { transform: translateY(-30%) rotateX(-80deg); opacity: 0; }
          65%  { transform: translateY(3%) rotateX(5deg); opacity: 1; }
          100% { transform: translateY(0) rotateX(0deg); opacity: 1; }
        }
        @keyframes vinylSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes cardEnterRight {
          from { transform: translateX(48px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes cardEnterLeft {
          from { transform: translateX(-48px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <audio
        ref={audioRef}
        loop
        src="./media/audio/The Beatles - Here, There and Everywhere.mp3"
      />

      {/* ── FIXED 3D CANVAS (always behind page when opened) ─────────────────── */}
      {mounted && isOpened && (
        <Canvas
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            width: "100%",
            height: "100%",
          }}
          camera={{ position: [0, 2.2, 7.5], fov: 58 }}
          dpr={[1, 1.5]}
        >
          <Scene spinning={isPlaying} sceneState={sceneStateRef} />
        </Canvas>
      )}

      {/* ── GOLD CONFETTI OVERLAY ─────────────────────────────────────────────── */}
      <Confetti
        active={confettiActive}
        onDone={() => setConfettiActive(false)}
      />

      {/* ── ENTRY PORTAL ─────────────────────────────────────────────────────── */}
      {!isOpened && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
          style={{ background: C.bg }}
        >
          {/* Background image */}
          <div className="absolute inset-0 opacity-40 transition-all duration-[8000ms] scale-105 hover:scale-100">
            <img
              src="https://images.pexels.com/photos/29404698/pexels-photo-29404698.jpeg"
              className="w-full h-full object-cover filter grayscale"
              alt="Background wedding venue"
            />
          </div>

          {/* Starfield (client-only) */}
          {mounted && (
            <Canvas
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
              camera={{ position: [0, 0, 5], fov: 75 }}
            >
              <Stars
                radius={80}
                depth={50}
                count={2200}
                factor={3}
                saturation={0.1}
                fade={true}
                speed={0.3}
              />
              <ambientLight intensity={0.1} />
            </Canvas>
          )}

          {/* Portal card */}
          <div
            className="relative z-10 text-center w-full max-w-md px-8 py-14 rounded-2xl backdrop-blur-xl"
            style={{
              border: `1px solid ${C.gold}28`,
              background: "rgba(4,12,30,0.88)",
            }}
          >
            {/* Classical ornament */}
            <svg
              viewBox="0 0 120 36"
              className="w-20 mx-auto mb-6"
              style={{ opacity: 0.62 }}
            >
              <path
                d="M60 0 C 48 10,24 14,0 14 C 24 14,36 24,60 36 C 84 24,96 14,120 14 C 96 14,72 10,60 0 Z"
                fill={C.gold}
              />
            </svg>

            {toName && (
              <p
                className="font-serif italic text-base mb-1"
                style={{ color: C.ivory }}
              >
                Dear <span style={{ color: C.gold }}>{toName}</span>,
              </p>
            )}

            <p
              className="text-[10px] uppercase tracking-[0.35em] mb-3"
              style={{ color: C.gold }}
            >
              You Are Cordially Invited
            </p>

            <h1
              className="font-serif font-light leading-tight mb-4"
              style={{
                fontSize: "clamp(2rem,8vw,3rem)",
                letterSpacing: "0.04em",
                color: C.ivory,
              }}
            >
              Alfiana
              <br />
              <span
                className="font-serif italic"
                style={{ fontSize: "0.5em", color: `${C.gold}cc` }}
              >
                &amp;
              </span>
              <br />
              Aln Pujo
            </h1>

            <p
              className="font-serif italic text-sm leading-relaxed mb-8"
              style={{ color: C.muted }}
            >
              To witness and celebrate a love that grew
              <br className="hidden sm:inline" /> like a slow, classical
              symphony.
            </p>

            <button
              onClick={handleOpen}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-md font-bold text-xs uppercase tracking-[0.22em] transition-all duration-300 hover:brightness-110 active:scale-95"
              style={{ background: C.gold, color: "#0a0600" }}
            >
              Open Invitation
              <Heart
                className="w-3.5 h-3.5"
                style={{ fill: "#0a0600", color: "#0a0600" }}
              />
            </button>

            <p
              className="text-[9px] uppercase tracking-[0.2em] mt-8"
              style={{ color: `${C.muted}80` }}
            >
              28 November 2026 · Kota Bandung, Indonesia
            </p>
          </div>
        </div>
      )}

      {/* ── FLOATING MUSIC BUTTON ─────────────────────────────────────────────── */}
      {isOpened && (
        <button
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-50 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95"
          style={{
            width: "52px",
            height: "52px",
            background: isPlaying ? C.gold : C.card,
            color: isPlaying ? "#0a0600" : C.ivory,
            border: `1px solid ${C.gold}44`,
          }}
        >
          {isPlaying ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>
      )}

      {/* ── SCROLLABLE CONTENT (z:1 — sits above the fixed canvas) ──────────── */}
      <div
        className="relative transition-all duration-1000"
        style={{
          zIndex: 1,
          opacity: isOpened ? 1 : 0,
          transform: isOpened ? "none" : "scale(0.97)",
          pointerEvents: isOpened ? "auto" : "none",
        }}
      >
        {/* ── HERO: transparent — 3D canvas shows fully ──────────────────────── */}
        <section
          data-section="0"
          className="relative overflow-hidden"
          style={{ height: "100dvh" }}
        >
          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 pointer-events-none">
            <p
              className="text-[10px] uppercase tracking-[0.35em] mb-2"
              style={{ color: C.gold }}
            >
              We Are Getting Married
            </p>

            <h1
              className="font-serif font-light text-center mb-2 drop-shadow-2xl"
              style={{
                fontSize: "clamp(2rem,7vw,4.5rem)",
                letterSpacing: "0.06em",
                color: C.ivory,
                textShadow: "0 4px 32px rgba(0,0,0,0.85)",
              }}
            >
              Alfiana{" "}
              <span
                className="font-serif italic"
                style={{ fontSize: "0.55em", color: C.gold }}
              >
                &amp;
              </span>{" "}
              Aln Pujo
            </h1>

            <p className="text-sm tracking-[0.22em]" style={{ color: C.muted }}>
              28 · 11 · 2026
            </p>

            {/* Scroll cue */}
            <div className="flex flex-col items-center gap-2 mt-7">
              <p
                className="text-[9px] uppercase tracking-[0.2em]"
                style={{ color: `${C.muted}80` }}
              >
                Scroll to Explore
              </p>
              <div
                className="w-px h-10"
                style={{
                  background: `linear-gradient(${C.gold}, transparent)`,
                }}
              />
            </div>
          </div>

          {/* Fade into next glass section */}
          <div
            className="absolute bottom-0 inset-x-0 h-44 pointer-events-none"
            style={{
              background: `linear-gradient(transparent, rgba(4,12,30,0.92))`,
            }}
          />
        </section>

        {/* ── GROOM & BRIDE (glass panel) ────────────────────────────────────── */}
        <section
          data-section="1"
          className="py-24 px-4"
          style={{
            background: "rgba(4,12,30,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <p
              className="text-[10px] uppercase tracking-[0.3em] mb-2"
              style={{ color: C.gold }}
            >
              The Couple
            </p>
            <h2
              className="font-serif text-3xl md:text-5xl font-light mb-16"
              style={{ color: C.ivory }}
            >
              Two Hearts, One Journey
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-16 md:gap-0 items-center">
              <CoupleCard
                role="The Groom"
                name="ALN PUJO PRIAMBODO"
                sub={"Son of Mr. Alib\n& Mrs. Nur Nasekhah"}
                img="https://images.pexels.com/photos/33644335/pexels-photo-33644335.jpeg?auto=compress&cs=tinysrgb&w=600"
              />

              {/* Desktop divider */}
              <div className="hidden md:flex flex-col items-center px-10 self-stretch justify-center">
                <div
                  className="flex-1 w-px"
                  style={{ background: `${C.gold}22` }}
                />
                <div
                  className="my-4 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    border: `1px solid ${C.gold}44`,
                    background: C.card,
                  }}
                >
                  <Heart
                    className="w-4 h-4"
                    style={{ fill: C.gold, color: C.gold }}
                  />
                </div>
                <div
                  className="flex-1 w-px"
                  style={{ background: `${C.gold}22` }}
                />
              </div>

              {/* Mobile divider */}
              <div className="flex md:hidden items-center gap-4 w-full">
                <div
                  className="flex-1 h-px"
                  style={{ background: `${C.gold}22` }}
                />
                <Heart
                  className="w-4 h-4 flex-shrink-0"
                  style={{ fill: C.gold, color: C.gold }}
                />
                <div
                  className="flex-1 h-px"
                  style={{ background: `${C.gold}22` }}
                />
              </div>

              <CoupleCard
                role="The Bride"
                name="ALFIANA YUNIARIANTI"
                sub={"Daughter of Mr. Ach. Tugianto\n& Mrs. Nurida Wijayanti"}
                img="https://images.pexels.com/photos/12396627/pexels-photo-12396627.jpeg?auto=compress&cs=tinysrgb&w=600"
              />
            </div>
          </div>
        </section>

        {/* ── LOVE STORY (glass + CSS vinyl + polaroids) ───────────────────────── */}
        <section
          data-section="2"
          className="py-24 px-4 overflow-hidden"
          style={{
            background: "rgba(4,12,30,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <p
                className="text-[10px] uppercase tracking-[0.3em] mb-2"
                style={{ color: C.gold }}
              >
                Our Journey
              </p>
              <h2
                className="font-serif text-3xl md:text-5xl font-light mb-4"
                style={{ color: C.ivory }}
              >
                Love Story
              </h2>
              <p
                className="text-sm md:text-base leading-relaxed"
                style={{ color: C.muted }}
              >
                Music has always been the thread that wove us together. Click
                any polaroid to read a fragment of our story.
              </p>
            </div>

            {/* Grid: vinyl+polaroids | story panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left: CSS vinyl + overlaid polaroids */}
              <div className="lg:col-span-7 flex justify-center items-center relative py-6 md:py-12 px-2 min-h-[360px] sm:min-h-[460px] md:min-h-[560px]">
                <div
                  className="relative flex items-center justify-center origin-center"
                  style={{
                    width: "min(460px, 92vw)",
                    aspectRatio: "1",
                    transform: "scale(0.75) sm:scale(0.95)",
                  }}
                >
                  {/* CSS Vinyl record */}
                  <div
                    className="absolute rounded-full flex items-center justify-center overflow-hidden select-none"
                    style={{
                      left: "-28%",
                      width: "105%",
                      aspectRatio: "1",
                      background:
                        "conic-gradient(from 0deg, #080f1c, #111c30, #080f1c, #111c30, #080f1c)",
                      boxShadow:
                        "0 24px 60px -10px rgba(0,0,0,0.9), 0 0 0 4px rgba(201,168,76,0.14)",
                      animation: "vinylSpin 8s linear infinite",
                      animationPlayState: isPlaying ? "running" : "paused",
                    }}
                  >
                    {/* Groove rings */}
                    {[8, 17, 26, 36, 46, 56, 66].map((inset) => (
                      <div
                        key={inset}
                        className="absolute rounded-full"
                        style={{
                          inset: `${inset}%`,
                          border: `1px solid ${inset % 2 === 0 ? "rgba(20,50,90,0.55)" : "rgba(30,65,110,0.35)"}`,
                        }}
                      />
                    ))}
                    {/* Label circle */}
                    <div
                      className="relative rounded-full flex flex-col items-center justify-center text-center z-10"
                      style={{
                        width: "34%",
                        height: "34%",
                        background:
                          "radial-gradient(circle at 40% 35%, #f2d872, #c9a84c 60%, #9c7820)",
                        boxShadow: "0 0 0 5px rgba(156,120,32,0.5)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "5px",
                          color: "#1a0900",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          fontWeight: 700,
                        }}
                      >
                        LP · 33 RPM
                      </span>
                      <div
                        style={{
                          height: "1px",
                          width: "60%",
                          background: "rgba(0,0,0,0.25)",
                          margin: "2px 0",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#1a0900",
                          fontFamily: "Georgia, serif",
                          fontStyle: "italic",
                          fontWeight: 700,
                        }}
                      >
                        A &amp; A
                      </span>
                      <span
                        style={{
                          fontSize: "4px",
                          color: "#1a0900",
                          opacity: 0.65,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        Est. 2023
                      </span>
                      {/* Center spindle hole */}
                      <div
                        className="absolute rounded-full"
                        style={{
                          width: "18px",
                          height: "18px",
                          background: "rgba(0,0,0,0.75)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Polaroid 1 — top right */}
                  <div
                    onClick={() =>
                      setActivePhotoIndex(activePhotoIndex === 0 ? null : 0)
                    }
                    className="absolute bg-white rounded-sm shadow-xl hover:shadow-2xl border border-stone-100 hover:scale-105 hover:z-30 transition-all duration-300 cursor-pointer select-none"
                    style={{
                      top: "3%",
                      right: "10%",
                      width: "46%",
                      transform: `rotate(-3deg)`,
                      zIndex: activePhotoIndex === 0 ? 30 : 10,
                      padding: "10px 10px 28px",
                    }}
                  >
                    <div
                      className="w-full overflow-hidden bg-stone-100"
                      style={{ aspectRatio: "1" }}
                    >
                      <img
                        src={LOVE_STORY[0].url}
                        alt={LOVE_STORY[0].title}
                        className="w-full h-full object-cover transition-all duration-500"
                        style={{
                          filter:
                            activePhotoIndex === 0 ? "none" : "grayscale(0.85)",
                        }}
                      />
                    </div>
                    <p className="mt-2 text-center font-serif text-[10px] text-stone-700 tracking-wide font-semibold truncate">
                      {LOVE_STORY[0].title}
                    </p>
                    <p className="text-center text-[7px] text-stone-400 tracking-widest uppercase font-bold">
                      {LOVE_STORY[0].date}
                    </p>
                  </div>

                  {/* Polaroid 2 — center right */}
                  <div
                    onClick={() =>
                      setActivePhotoIndex(activePhotoIndex === 1 ? null : 1)
                    }
                    className="absolute bg-white rounded-sm shadow-xl hover:shadow-2xl border border-stone-100 hover:scale-105 hover:z-30 transition-all duration-300 cursor-pointer select-none"
                    style={{
                      top: "32%",
                      right: "0%",
                      width: "46%",
                      transform: `rotate(5deg)`,
                      zIndex: activePhotoIndex === 1 ? 30 : 10,
                      padding: "10px 10px 28px",
                    }}
                  >
                    <div
                      className="w-full overflow-hidden bg-stone-100"
                      style={{ aspectRatio: "1" }}
                    >
                      <img
                        src={LOVE_STORY[1].url}
                        alt={LOVE_STORY[1].title}
                        className="w-full h-full object-cover transition-all duration-500"
                        style={{
                          filter:
                            activePhotoIndex === 1 ? "none" : "grayscale(0.85)",
                        }}
                      />
                    </div>
                    <p className="mt-2 text-center font-serif text-[10px] text-stone-700 tracking-wide font-semibold truncate">
                      {LOVE_STORY[1].title}
                    </p>
                    <p className="text-center text-[7px] text-stone-400 tracking-widest uppercase font-bold">
                      {LOVE_STORY[1].date}
                    </p>
                  </div>

                  {/* Polaroid 3 — bottom right */}
                  <div
                    onClick={() =>
                      setActivePhotoIndex(activePhotoIndex === 2 ? null : 2)
                    }
                    className="absolute bg-white rounded-sm shadow-xl hover:shadow-2xl border border-stone-100 hover:scale-105 hover:z-30 transition-all duration-300 cursor-pointer select-none"
                    style={{
                      bottom: "2%",
                      right: "11%",
                      width: "46%",
                      transform: `rotate(-2deg)`,
                      zIndex: activePhotoIndex === 2 ? 30 : 10,
                      padding: "10px 10px 28px",
                    }}
                  >
                    <div
                      className="w-full overflow-hidden bg-stone-100"
                      style={{ aspectRatio: "1" }}
                    >
                      <img
                        src={LOVE_STORY[2].url}
                        alt={LOVE_STORY[2].title}
                        className="w-full h-full object-cover transition-all duration-500"
                        style={{
                          filter:
                            activePhotoIndex === 2 ? "none" : "grayscale(0.85)",
                        }}
                      />
                    </div>
                    <p className="mt-2 text-center font-serif text-[10px] text-stone-700 tracking-wide font-semibold truncate">
                      {LOVE_STORY[2].title}
                    </p>
                    <p className="text-center text-[7px] text-stone-400 tracking-widest uppercase font-bold">
                      {LOVE_STORY[2].date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Interactive story text panel */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {LOVE_STORY.map((story, i) => (
                  <div
                    key={i}
                    onClick={() =>
                      setActivePhotoIndex(activePhotoIndex === i ? null : i)
                    }
                    className="p-5 rounded-xl border transition-all duration-300 cursor-pointer"
                    style={{
                      background:
                        activePhotoIndex === i ? C.card : "transparent",
                      borderColor:
                        activePhotoIndex === i ? C.border : "transparent",
                      transform:
                        activePhotoIndex === i ? "scale(1.02)" : "scale(1)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm border flex-shrink-0 transition-all duration-300"
                        style={{
                          background: activePhotoIndex === i ? C.gold : C.card,
                          color: activePhotoIndex === i ? "#0a0600" : C.muted,
                          borderColor:
                            activePhotoIndex === i ? C.gold : C.border,
                        }}
                      >
                        {i + 1}
                      </span>
                      <h4
                        className="font-serif text-lg font-semibold tracking-wide flex-1"
                        style={{ color: C.ivory }}
                      >
                        {story.title}
                      </h4>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: C.muted, opacity: 0.6 }}
                      >
                        {story.date}
                      </span>
                    </div>
                    <p
                      className="text-sm leading-relaxed transition-all duration-300 ml-11"
                      style={{
                        color: C.muted,
                        opacity: activePhotoIndex === i ? 1 : 0.55,
                      }}
                    >
                      {story.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── COUNTDOWN (glass + flip tiles + glow ring in 3D) ───────────────── */}
        <section
          data-section="3"
          className="py-20 px-4 text-center"
          style={{
            background: "rgba(2,13,31,0.90)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.3em] mb-6"
            style={{ color: C.gold }}
          >
            Counting Down To Forever
          </p>
          <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
            {[
              { label: "Days", val: countdown.days },
              { label: "Hours", val: countdown.hours },
              { label: "Mins", val: countdown.minutes },
              { label: "Secs", val: countdown.seconds },
            ].map(({ label, val }) => (
              <FlipTile key={label} label={label} val={val} />
            ))}
          </div>
        </section>

        {/* ── WEDDING DETAILS (glass) ─────────────────────────────────────────── */}
        <section
          data-section="4"
          className="py-24 px-4"
          style={{
            background: "rgba(4,12,30,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p
                className="text-[10px] uppercase tracking-[0.3em] mb-2"
                style={{ color: C.gold }}
              >
                Join Us On Our Big Day
              </p>
              <h2
                className="font-serif text-3xl md:text-4xl font-light"
                style={{ color: C.ivory }}
              >
                Wedding Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EventCard
                title="Akad Nikah"
                Icon={Calendar}
                time="08:00 – 10:00 WIB"
                venue="Graha Tirta Siliwangi"
                address="Kota Bandung, Indonesia (Family Only)"
                note="Venue"
                link="https://maps.app.goo.gl/tTptiHqepLYzptnt7"
              />
              <EventCard
                title="Reception"
                Icon={Heart}
                time="11:00 – 15:00 WIB"
                venue="Graha Tirta Siliwangi"
                address="Kota Bandung, Indonesia"
                note="Calendar"
                link="https://calendar.app.google/EjU2PiVzN15LQoMK9"
              />
            </div>
          </div>
        </section>

        {/* ── GIFT (glass) ──────────────────────────────────────────────────────── */}
        <section
          className="py-24 px-4"
          style={{
            background: "rgba(4,12,30,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-12">
              <p
                className="text-[10px] uppercase tracking-[0.3em] mb-2"
                style={{ color: C.gold }}
              >
                Wedding Gift
              </p>
              <h2
                className="font-serif text-3xl md:text-5xl font-light mb-4"
                style={{ color: C.ivory }}
              >
                Gift of Love
              </h2>
              <p
                className="text-sm leading-relaxed max-w-md mx-auto"
                style={{ color: C.muted }}
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
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:opacity-80"
                  style={{
                    background: CARD_GRADIENTS[activeCardIndex],
                    borderColor: C.border,
                    color: C.ivory,
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Bank card */}
                <div
                  className="overflow-hidden w-full max-w-sm rounded-2xl"
                  style={{ perspective: "1000px" }}
                >
                  <div
                    key={cardAnimKey}
                    className="relative rounded-2xl shadow-2xl overflow-hidden select-none"
                    style={{
                      background: CARD_GRADIENTS[activeCardIndex],
                      aspectRatio: "1.586 / 1",
                      animation:
                        cardAnimKey > 0
                          ? `${cardFromRight ? "cardEnterRight" : "cardEnterLeft"} 0.32s cubic-bezier(.22,.68,0,1.1) both`
                          : "none",
                    }}
                  >
                    {/* Decorative circles */}
                    <div
                      className="absolute -bottom-10 -right-10 w-52 h-52 rounded-full"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    />
                    <div
                      className="absolute -bottom-16 -right-20 w-52 h-52 rounded-full"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    />
                    <div
                      className="absolute top-0 -left-10 w-36 h-36 rounded-full"
                      style={{ background: "rgba(201,168,76,0.06)" }}
                    />
                    {/* Gold shimmer bar */}
                    <div
                      className="absolute inset-x-0 top-0 h-px"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${C.gold}44, transparent)`,
                      }}
                    />

                    {/* Card content */}
                    <div className="relative z-10 h-full flex flex-col justify-between p-6">
                      {/* Top: bank label + contactless */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p
                            className="text-[9px] uppercase tracking-[0.2em] font-semibold mb-0.5"
                            style={{ color: `${C.ivory}60` }}
                          >
                            {GIFT_ACCOUNTS[activeCardIndex].label}
                          </p>
                          <p
                            className="font-bold text-base tracking-widest uppercase"
                            style={{ color: C.ivory }}
                          >
                            {GIFT_ACCOUNTS[activeCardIndex].bank}
                          </p>
                        </div>
                        {/* Contactless rings */}
                        <svg
                          viewBox="0 0 24 24"
                          className="w-6 h-6"
                          fill="currentColor"
                          style={{ color: `${C.gold}55` }}
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

                      {/* EMV chip */}
                      <div className="flex items-center">
                        <div
                          className="relative w-10 h-8 rounded-md overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(135deg, #d4a843 0%, #a8832e 30%, #ffd700 50%, #b8942e 70%, #c9a84c 100%)",
                          }}
                        >
                          <div className="absolute inset-x-0 top-1/3 h-px bg-yellow-900/30" />
                          <div className="absolute inset-x-0 top-2/3 h-px bg-yellow-900/30" />
                          <div className="absolute inset-y-0 left-1/3 w-px bg-yellow-900/30" />
                          <div className="absolute inset-y-0 left-2/3 w-px bg-yellow-900/30" />
                          <div className="absolute inset-[3px] border border-yellow-700/30 rounded-sm" />
                        </div>
                      </div>

                      {/* Account number */}
                      <p
                        className="font-mono text-lg md:text-xl tracking-[0.18em] font-semibold"
                        style={{ color: C.ivory }}
                      >
                        {formatAccount(GIFT_ACCOUNTS[activeCardIndex].account)}
                      </p>

                      {/* Bottom: name + heart */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p
                            className="text-[9px] uppercase tracking-widest mb-0.5"
                            style={{ color: `${C.ivory}40` }}
                          >
                            Account Name
                          </p>
                          <p
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: C.ivory }}
                          >
                            {GIFT_ACCOUNTS[activeCardIndex].name}
                          </p>
                        </div>
                        <Heart
                          className="w-5 h-5 -rotate-6"
                          style={{ color: C.gold, fill: C.gold }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next arrow */}
                <button
                  onClick={() => switchCard("next")}
                  aria-label="Next account"
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:opacity-80"
                  style={{
                    background: CARD_GRADIENTS[activeCardIndex],
                    borderColor: C.border,
                    color: C.ivory,
                  }}
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
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === activeCardIndex ? "24px" : "6px",
                      background: i === activeCardIndex ? C.gold : C.muted,
                      opacity: i === activeCardIndex ? 1 : 0.4,
                    }}
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
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-xl border transition-all duration-200"
                style={{
                  borderColor: C.border,
                  color: C.gold,
                  background: "transparent",
                }}
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

        {/* ── RSVP & GUESTBOOK (glass) ──────────────────────────────────────────── */}
        <section
          data-section="5"
          className="py-24 px-4"
          style={{
            background: "rgba(2,13,31,0.90)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              {/* RSVP Form */}
              <div
                className="rounded-2xl p-8 md:p-10"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.3em] mb-1"
                  style={{ color: C.gold }}
                >
                  Be Our Guest
                </p>
                <h3
                  className="font-serif text-2xl font-light mb-6"
                  style={{ color: C.ivory }}
                >
                  Will You Attend?
                </h3>

                {submitted ? (
                  <div className="text-center py-10">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: C.gold }}
                    >
                      <Check className="w-6 h-6" style={{ color: "#0a0600" }} />
                    </div>
                    <p
                      className="font-serif text-xl mb-2"
                      style={{ color: C.ivory }}
                    >
                      Thank You!
                    </p>
                    <p className="text-sm" style={{ color: C.muted }}>
                      We look forward to celebrating with you.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRsvp} className="flex flex-col gap-4">
                    <input
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                      style={{
                        background: C.bgAlt,
                        border: `1px solid ${C.border}`,
                        color: C.ivory,
                      }}
                    />
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, status: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                      style={{
                        background: C.bgAlt,
                        border: `1px solid ${C.border}`,
                        color: C.ivory,
                      }}
                    >
                      <option value="attending">✓ Attending</option>
                      <option value="maybe">? Maybe</option>
                      <option value="not-attending">✗ Can&apos;t Attend</option>
                    </select>
                    <textarea
                      rows={3}
                      placeholder="Your wishes for the couple..."
                      value={formData.wishes}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, wishes: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
                      style={{
                        background: C.bgAlt,
                        border: `1px solid ${C.border}`,
                        color: C.ivory,
                      }}
                    />
                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200 hover:brightness-110 active:scale-95"
                      style={{ background: C.gold, color: "#0a0600" }}
                    >
                      <Send className="w-4 h-4" /> Send RSVP
                    </button>
                  </form>
                )}
              </div>

              {/* Guestbook */}
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.3em] mb-1"
                  style={{ color: C.gold }}
                >
                  Wishes &amp; Blessings
                </p>
                <h3
                  className="font-serif text-2xl font-light mb-6"
                  style={{ color: C.ivory }}
                >
                  Guestbook
                </h3>
                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                  {guestbook.map((g, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-5"
                      style={{
                        background: C.card,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: C.ivory }}
                        >
                          {g.name}
                        </span>
                        <span
                          className="text-[9px] uppercase tracking-widest"
                          style={{
                            color: g.status === "attending" ? C.gold : C.muted,
                          }}
                        >
                          {g.status === "attending"
                            ? "Attending"
                            : g.status === "maybe"
                              ? "Maybe"
                              : "Can't Attend"}
                        </span>
                      </div>
                      <p
                        className="text-xs italic leading-relaxed"
                        style={{ color: C.muted }}
                      >
                        &ldquo;{g.message}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer
          className="py-16 text-center"
          style={{
            background: "rgba(1,8,16,0.97)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <p
            className="text-[9px] uppercase tracking-[0.3em] mb-3"
            style={{ color: `${C.muted}70` }}
          >
            Save The Date
          </p>
          <h4
            className="font-serif text-3xl font-light tracking-[0.2em] mb-1"
            style={{ color: C.gold }}
          >
            A &amp; A
          </h4>
          <p className="text-xs tracking-[0.15em]" style={{ color: C.muted }}>
            November 28th, 2026 · Kota Bandung, Indonesia
          </p>
          <div
            className="w-10 h-px mx-auto my-6"
            style={{ background: `${C.gold}30` }}
          />
          <p
            className="text-[9px] uppercase tracking-widest"
            style={{ color: `${C.muted}50` }}
          >
            Crafted with classical adoration and musical memories.
          </p>
        </footer>
      </div>
    </div>
  );
}
