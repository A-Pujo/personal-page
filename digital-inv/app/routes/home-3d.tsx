import React, { useState, useEffect, useMemo, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import {
  Heart,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  Send,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";

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

// ─── 3D: Vinyl disc canvas texture ───────────────────────────────────────────
function useVinylTexture() {
  return useMemo<THREE.CanvasTexture>(() => {
    const S = 512;
    const el = document.createElement("canvas");
    el.width = el.height = S;
    const ctx = el.getContext("2d")!;
    const cx = S / 2,
      cy = S / 2;

    // Vinyl base – deep navy blue
    ctx.fillStyle = "#0b1624";
    ctx.fillRect(0, 0, S, S);

    // Groove rings
    for (let r = 18; r <= 244; r += 6) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r < 120 ? "18,48,88" : "28,62,108"},${0.2 + r / 900})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Highlight sheen (top-left arc)
    const sheen = ctx.createRadialGradient(cx - 70, cy - 70, 10, cx, cy, 240);
    sheen.addColorStop(0, "rgba(90,130,190,0.14)");
    sheen.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sheen;
    ctx.beginPath();
    ctx.arc(cx, cy, 240, 0, Math.PI * 2);
    ctx.fill();

    // Label gold circle
    const lg = ctx.createRadialGradient(cx, cy - 6, 0, cx, cy, 70);
    lg.addColorStop(0, "#f2d872");
    lg.addColorStop(0.6, "#c9a84c");
    lg.addColorStop(1, "#9c7820");
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(cx, cy, 70, 0, Math.PI * 2);
    ctx.fill();

    // Label inner ring
    ctx.strokeStyle = "rgba(55,30,4,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 63, 0, Math.PI * 2);
    ctx.stroke();

    // Label text
    ctx.textAlign = "center";
    ctx.fillStyle = "#1a0900";
    ctx.font = "bold italic 28px Georgia,serif";
    ctx.fillText("A & A", cx, cy - 10);
    ctx.font = "12px Georgia,serif";
    ctx.fillText("28 · 11 · 2026", cx, cy + 13);
    ctx.font = "italic 9px Georgia,serif";
    ctx.fillStyle = "rgba(26,9,0,0.62)";
    ctx.fillText("Kota Bandung", cx, cy + 28);

    // Center spindle hole
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(el);
  }, []);
}

// ─── 3D: Vinyl Record ─────────────────────────────────────────────────────────
function VinylRecord({ spinning }: { spinning: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useVinylTexture();

  useFrame((_, dt) => {
    if (groupRef.current && spinning) groupRef.current.rotation.y += dt * 0.42;
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

// ─── 3D: Camera Parallax ──────────────────────────────────────────────────────
function CameraRig() {
  const mouse = useRef({ x: 0, y: 0 });

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
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      mouse.current.x * 0.45,
      0.04,
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      2.2 + mouse.current.y * 0.25,
      0.04,
    );
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── 3D: Full Scene ───────────────────────────────────────────────────────────
function Scene({ spinning }: { spinning: boolean }) {
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
      <VinylRecord spinning={spinning} />
      <CameraRig />
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
    <div className="flex flex-col items-center text-center gap-5">
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
          View Map <ChevronRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function Home3D() {
  const [isOpened, setIsOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    status: "attending",
    wishes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [guestbook, setGuestbook] = useState([
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
  ]);

  const countdown = useCountdown();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => setMounted(true), []);

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
    setGuestbook((prev) => [
      {
        name: formData.name,
        status: formData.status,
        message: formData.wishes || "Selamat dan bahagia selalu!",
      },
      ...prev,
    ]);
    setSubmitted(true);
  };

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ background: C.bg, color: C.ivory }}
    >
      <audio
        ref={audioRef}
        loop
        src="./media/audio/The Beatles - Here, There and Everywhere.mp3"
      />

      {/* ── ENTRY PORTAL ─────────────────────────────────────────────────────── */}
      {!isOpened && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
          style={{ background: C.bg }}
        >
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

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div
        className="transition-all duration-1000"
        style={{
          opacity: isOpened ? 1 : 0,
          transform: isOpened ? "none" : "scale(0.97)",
          pointerEvents: isOpened ? "auto" : "none",
        }}
      >
        {/* ── HERO: 3D SCENE ─────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ height: "100dvh" }}
        >
          {/* Three.js canvas (client-only) */}
          {mounted ? (
            <Canvas
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
              camera={{ position: [0, 2.2, 7.5], fov: 58 }}
              dpr={[1, 1.5]}
            >
              <Scene spinning={isPlaying} />
            </Canvas>
          ) : (
            <div className="absolute inset-0" style={{ background: C.bg }} />
          )}

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

          {/* Bottom fade-to-bg */}
          <div
            className="absolute bottom-0 inset-x-0 h-44 pointer-events-none"
            style={{ background: `linear-gradient(transparent, ${C.bg})` }}
          />
        </section>

        {/* ── GROOM & BRIDE ──────────────────────────────────────────────────── */}
        <section
          className="py-24 px-4"
          style={{ background: C.bgAlt, borderTop: `1px solid ${C.divider}` }}
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

        {/* ── COUNTDOWN ──────────────────────────────────────────────────────── */}
        <section
          className="py-20 px-4 text-center"
          style={{ background: C.bg, borderTop: `1px solid ${C.divider}` }}
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
              <div
                key={label}
                className="rounded-xl py-5"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <p
                  className="font-serif font-light text-3xl leading-none"
                  style={{ color: C.gold }}
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
            ))}
          </div>
        </section>

        {/* ── WEDDING DETAILS ───────────────────────────────────────────────── */}
        <section
          className="py-24 px-4"
          style={{ background: C.bgAlt, borderTop: `1px solid ${C.divider}` }}
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
                address="Kota Bandung, Indonesia"
                note="Family Only"
                link="https://maps.app.goo.gl/tTptiHqepLYzptnt7"
              />
              <EventCard
                title="Reception"
                Icon={Heart}
                time="11:00 – 15:00 WIB"
                venue="Graha Tirta Siliwangi"
                address="Kota Bandung, Indonesia"
                note="Reception & Live Music"
                link="https://calendar.app.google/EjU2PiVzN15LQoMK9"
              />
            </div>
          </div>
        </section>

        {/* ── RSVP & GUESTBOOK ──────────────────────────────────────────────── */}
        <section
          className="py-24 px-4"
          style={{ background: C.bg, borderTop: `1px solid ${C.divider}` }}
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
          style={{ background: "#010810", borderTop: `1px solid ${C.divider}` }}
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
