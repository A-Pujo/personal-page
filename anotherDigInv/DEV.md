# Spesifikasi Teknis: Undangan Pernikahan Interaktif 3D (RPG Fishing Adventure)

Dokumen ini adalah panduan implementasi lengkap untuk dikerjakan di IDE (VS Code/Cursor, dsb). Ditujukan untuk developer yang akan membangun web undangan pernikahan interaktif bertema "petualangan memancing" menggunakan Three.js.

---

## 1. Ringkasan Proyek

**Judul:** "Kisah Kita: Sebuah Perjalanan Memancing" — Undangan Pernikahan ALN & Alfiana

**Konsep:** Situs single-page berbentuk game RPG ringan (light interaction, click-to-advance) bergaya voxel low-poly, bertema danau/dermaga/memancing. Tamu "memainkan" perjalanan hubungan mempelai lewat 5 babak (quest), diakhiri RSVP via Google Calendar.

**Mempelai:**

- Pria: ALN PUJO PRIAMBODO
- Wanita: ALFIANA YUNIARIANTI

**Acara:**

- Tanggal: 28 November 2026, pukul 10:00 WIB
- Tempat: Graha Tirta Siliwangi, Jl. Lombok No.10, Merdeka, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40113

**RSVP:** Tombol yang membuka Google Calendar invite: `https://calendar.app.google/aMVDdhrgRK4zBm49A`

**Bahasa konten:** Bahasa Indonesia (formal namun hangat)

**Target device:** Mobile-first (asumsikan 80% tamu buka dari HP), harus tetap bagus di desktop.

---

## 2. Tech Stack

| Layer            | Pilihan                                                                                                                            | Alasan                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 3D Engine        | **Three.js** (r160+, via ES modules / npm)                                                                                         | Ringan, kontrol penuh atas geometry procedural                                         |
| Build tool       | **Vite**                                                                                                                           | Dev server cepat, HMR, build produksi teroptimasi, native ES module support            |
| Animasi/transisi | **GSAP** (core + ScrollTrigger tidak wajib karena interaksi berbasis klik, tapi tetap pakai GSAP core untuk tweening kamera/objek) | Tweening yang smooth dan mudah di-sequence                                             |
| Font             | Google Fonts: **"Cormorant Garamond"** (heading, elegan) + **"Poppins"** (body, jelas dibaca)                                      | Kombinasi elegan + modern                                                              |
| Hosting          | Static hosting: **Vercel** atau **Netlify** (drag-drop `dist/` folder)                                                             | Gratis, cepat, cocok untuk static site                                                 |
| Asset 3D         | **Procedural geometry** (BoxGeometry, ConeGeometry, custom low-poly meshes) — TIDAK pakai file GLTF eksternal                      | Menghindari dependency asset besar, load time cepat, semua bisa di-generate lewat kode |

Tidak perlu backend/database. Semua state disimpan di client (JS memory), RSVP diarahkan keluar ke Google Calendar.

---

## 3. Struktur Folder Proyek

```
wedding-invitation/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js                 # entry point, init scene & state machine
│   ├── style.css                # UI overlay (teks, tombol) di atas canvas
│   ├── content.js                # SEMUA copy teks Bahasa Indonesia (data-driven)
│   ├── scene/
│   │   ├── SceneManager.js       # setup renderer, camera, lighting, resize handler
│   │   ├── QuestController.js    # state machine: quest 1 → 5, transisi antar scene
│   │   ├── assets/
│   │   │   ├── createDock.js     # geometry dermaga (Quest 1)
│   │   │   ├── createLake.js     # geometry air + shader gelombang sederhana
│   │   │   ├── createBoat.js     # geometry perahu kecil (kamera "naik" perahu)
│   │   │   ├── createRod.js      # geometry joran + animasi cast
│   │   │   ├── createFish.js     # geometry ikan bercahaya (Quest 3 - momen lamaran)
│   │   │   ├── createChest.js    # peti harta karun (Quest 4 - reveal detail acara)
│   │   │   ├── createTackleBox.js# kotak alat pancing (Quest 5 - RSVP "gabung kru")
│   │   │   └── createEnvironment.js # langit gradient sunset, particle kunang-kunang/kabut
│   │   └── effects/
│   │       ├── particles.js      # partikel cahaya/kunang-kunang, splash air
│   │       └── postprocessing.js # bloom ringan (opsional, cek performa mobile dulu)
│   └── utils/
│       ├── responsive.js         # deteksi mobile, cap pixelRatio, scale kompleksitas
│       └── raycastInteraction.js # deteksi klik/tap pada objek 3D (mis. klik joran untuk cast)
├── public/
│   └── favicon, og-image, dsb.
└── README.md
```

---

## 4. Struktur Narasi & Pemetaan Quest

Setiap quest = 1 scene 3D + 1 momen cerita + 1 interaksi klik untuk lanjut. Kamera berpindah antar "titik" di sekitar danau yang sama (bukan reload scene total) agar transisi mulus — gunakan GSAP untuk tween posisi kamera antar quest.

### Quest 0 — Landing / Judul

- **Visual:** Layar judul dengan langit sunset gradient (oranye-ungu), siluet dermaga & perahu, partikel kunang-kunang melayang.
- **Copy:**
  - Sapaan personal (lihat §4.1 Nama Tamu via URL): "Yth. {Nama Tamu}" atau fallback "Yth. Bapak/Ibu/Saudara/i"
  - Judul kecil: "Undangan Pernikahan"
  - Nama besar: "ALN & Alfiana"
  - Subjudul: "Sebuah perjalanan menuju janji suci"
  - Tombol utama: **"Mulai Petualangan"**
  - Tombol sekunder (kecil, low-emphasis): **"Lewati ke Detail Acara"** → langsung loncat ke Quest 4 (skip storytelling)
- **Interaksi:** Klik "Mulai Petualangan" → kamera zoom in ke dermaga, transisi ke Quest 1. Klik "Lewati ke Detail Acara" → transisi langsung ke Quest 4.
- **Catatan:** Tombol skip HANYA ada di sini (Landing). Setelah tamu masuk ke Quest 1 dst., tidak ada jalan pintas lagi — dianggap sudah komit menonton cerita sampai selesai.

#### 4.1 Nama Tamu via URL Parameter

- Parameter: `?to=` pada URL, mis. `https://domain.com/?to=Budi+Santoso` (spasi di-encode sebagai `+`).
- Parsing pakai `URLSearchParams`, decode `+` jadi spasi secara eksplisit (`URLSearchParams` sudah handle ini secara default untuk query string).
- **Render wajib pakai `textContent`, bukan `innerHTML`** — mencegah injeksi HTML/script lewat parameter URL.
- Batasi panjang nama (maks ~40 karakter, trim whitespace) supaya layout kartu sapaan tidak jebol.
- Fallback kalau param kosong/tidak ada: tampilkan "Yth. Bapak/Ibu/Saudara/i" (link generik untuk grup umum).
- Nama tamu **hanya tampil di Quest 0 (Landing)** — tidak dibawa/direferensikan lagi di quest-quest berikutnya maupun di RSVP (Google Calendar link bersifat fixed, tidak menerima parameter dinamis).
- OG meta tag (title/description untuk preview link WA) bersifat **statis**, tidak personalized per nama tamu: judul preview cukup `"Undangan Pernikahan Alfiana & Aln"`.

### Quest 1 — Dermaga Awal (2020: Pertemuan)

- **Visual:** Kamera berdiri di dermaga kayu low-poly, danau tenang, kabut pagi.
- **Copy:**
  > "Tahun 2020, di bangku perkuliahan, dua sahabat pertama kali bertemu. Belum ada percikan istimewa — hanya sapaan singkat dan jalan yang sesekali bersinggungan."
- **Interaksi:** Klik area dermaga / tombol "Lanjutkan" → kamera bergerak menyusuri dermaga menuju perahu. Transisi ke Quest 2.

### Quest 2 — Melempar Kail (2023: Rekoneksi & Kisah Cinta)

- **Visual:** Kamera naik ke perahu kecil di tengah danau. Objek joran pancing muncul di tangan (first-person-ish, atau third-person melihat perahu).
- **Interaksi utama (light gameplay):** Tamu diminta klik/tap tombol **"Lempar Kail"** → trigger animasi cast (joran melengkung, tali melesat, splash air + particle riak).
- **Copy (muncul setelah animasi cast selesai):**
  > "Tahun 2023, takdir mempertemukan kembali. Dari yang dulunya sekadar teman, tumbuh cerita baru — perlahan namun pasti, benih itu berkembang menjadi kisah cinta."
- Transisi: tombol "Lanjutkan" → kamera bergerak, air mulai beriak lebih kuat menandakan "ada tarikan".

### Quest 3 — Tangkapan Istimewa (Sep 2025: Lamaran)

- **Visual:** Animasi "reeling in" — tali pancing tertarik, dari air muncul ikan low-poly bercahaya (emissive gold material) membawa cincin di mulutnya (bisa disederhanakan: ikan muncul lalu berubah/pecah jadi partikel yang membentuk cincin bersinar).
- **Interaksi:** Tombol **"Tarik Pancing"** → animasi reel-in + reveal cincin bercahaya melayang.
- **Copy:**
  > "September 2025. Tangkapan paling berharga bukanlah ikan — melainkan sebuah jawaban 'Ya' atas sebuah pertanyaan penting. Lamaran pun terucap, dan janji untuk melangkah bersama semakin nyata."
- Transisi: tombol "Buka Peti Harta Karun" → kamera bergerak ke tepi danau tempat peti berada.

### Quest 4 — Peti Harta Karun (Detail Acara Puncak)

- **Visual:** Peti kayu low-poly di dermaga, tertutup rantai bercahaya. Klik → peti terbuka, cahaya emas memancar, partikel naik ke atas membentuk tanggal.
- **Interaksi:** Tombol **"Buka Peti"** → animasi tutup peti terbuka (rotasi + emissive glow burst).
- **Copy (reveal, styled seperti "quest reward"):**
  > "28 November 2026, pukul 10:00 WIB, kami akan mengucap janji suci di hadapan-Nya."
  >
  > **Graha Tirta Siliwangi**
  > Jl. Lombok No.10, Merdeka, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40113
- Tambahkan tombol sekunder "Lihat Lokasi" → buka Google Maps (link maps berdasarkan alamat, generate via `https://www.google.com/maps/search/?api=1&query=` + encoded address).
- Transisi: tombol "Lanjutkan ke Kru" → kamera bergerak ke tackle box.

### Quest 5 — Gabung Kru (RSVP)

- **Visual:** Kotak alat pancing (tackle box) terbuka menampilkan "kartu anggota kru".
- **Copy:**
  > "Kehadiran serta doa restu Bapak/Ibu/Saudara/i akan menjadi kebahagiaan dan kehormatan besar bagi kami untuk mengarungi babak baru ini."
  >
  > "Konfirmasi kehadiranmu dan tandai kalender agar tak ketinggalan momen bahagia kami."
- **Tombol utama:** **"Konfirmasi Kehadiran (RSVP)"** → `window.open('https://calendar.app.google/aMVDdhrgRK4zBm49A', '_blank')`
- **Penutup kecil di bawah tombol:** "Sampai jumpa di 28 November 2026 — Salam hangat, ALN & Alfiana."

> Semua string di atas disimpan di `src/content.js` sebagai object per-quest, JANGAN hardcode di komponen scene. Ini memudahkan revisi teks tanpa menyentuh logic 3D.

---

## 5. Arsitektur Kode

### 5.1 State Machine (QuestController.js)

Gunakan pola state machine sederhana:

```js
const quests = [
  "intro",
  "meet2020",
  "reconnect2023",
  "proposal2025",
  "eventReveal",
  "rsvp",
];
let currentIndex = 0;

function goToQuest(index) {
  // 1. Trigger exit animation quest saat ini (GSAP fade out UI overlay)
  // 2. Tween kamera Three.js ke posisi target quest berikutnya (gsap.to(camera.position, {...}))
  // 3. Trigger enter animation objek 3D quest baru (mis. peti muncul, ikan spawn)
  // 4. Update UI overlay (teks dari content.js) dengan fade in
  // 5. currentIndex = index
}
```

Setiap quest punya konfigurasi: posisi kamera (Vector3 + lookAt target), objek yang perlu di-spawn/di-animate, dan copy text terkait.

### 5.2 Rendering Loop

- Satu `THREE.Scene` untuk seluruh pengalaman (bukan reload per quest) supaya transisi mulus.
- `requestAnimationFrame` loop standar: update animasi air (shader time uniform), update particle system, update camera tween (GSAP handle ini sendiri via ticker).
- Gunakan `THREE.Clock` untuk delta time agar animasi konsisten di semua refresh rate.

### 5.3 Interaksi Klik/Tap

- Gunakan `THREE.Raycaster` + event `pointerdown` (bukan `click` saja, agar responsif di touch) untuk deteksi klik pada objek 3D interaktif (joran, peti, tackle box).
- **Interaksi objek 3D bersifat WAJIB** untuk quest yang punya gameplay moment (Quest 2 "Lempar Kail", Quest 3 "Tarik Pancing", Quest 4 "Buka Peti") — klik langsung ke objek 3D adalah satu-satunya cara trigger animasi tersebut, BUKAN tombol UI biasa. Tombol UI ("Lanjutkan") tetap dipakai untuk transisi antar quest yang tidak butuh gameplay moment (mis. Quest 0 → 1, Quest 1 → 2).
- Karena wajib, perlu affordance & toleransi ekstra:
  - Beri indikasi visual objek bisa diklik: subtle glow/pulse/outline pada objek interaktif saat quest aktif.
  - Label kecil di UI mengarahkan aksi, mis. "Ketuk joran untuk melempar kail" — supaya tamu yang kurang familiar dengan game tetap tahu harus berbuat apa.
  - Hit area di mobile diperbesar dari mesh asli (raycast terhadap bounding box yang di-inflate, bukan mesh presisi) — penting untuk objek tipis seperti joran/tali.
  - Fallback hint: kalau user tap gagal berkali-kali (>5x) di luar objek yang benar, tampilkan hint singkat mengarahkan ke objek yang benar (aksesibilitas, tanpa melanggar aturan wajib klik objek).

### 5.4 UI Overlay

- Canvas Three.js full-screen (`position: fixed`), UI (judul, teks cerita, tombol) adalah HTML/CSS di atasnya dengan `position: absolute`, background semi-transparan / glassmorphism agar teks tetap terbaca di atas scene 3D.
- Gunakan CSS `backdrop-filter: blur(8px)` untuk card teks (cek fallback untuk browser lama).
- Transisi teks antar quest: fade + slight translateY via GSAP atau CSS transition.

---

## 6. Desain Visual & Asset (Low-Poly Voxel)

Semua asset dibuat procedural dari primitives Three.js — tidak perlu file model eksternal:

- **Air danau:** `PlaneGeometry` besar dengan custom `ShaderMaterial` (vertex displacement sinusoidal sederhana untuk efek gelombang + warna gradient biru-toska, sedikit transparan).
- **Dermaga:** Susunan `BoxGeometry` (papan kayu) dengan `MeshStandardMaterial` warna coklat, tekstur flat (tanpa image texture, cukup warna solid + sedikit roughness untuk kesan low-poly).
- **Perahu:** Bentuk dasar dari extrude/box sederhana yang di-taper, warna cokelat/putih.
- **Joran pancing:** `CylinderGeometry` tipis memanjang + garis tali dari `THREE.Line`.
- **Ikan bercahaya:** Bentuk low-poly (bisa pakai `IcosahedronGeometry` dimodifikasi atau custom `BufferGeometry` sederhana), material `MeshStandardMaterial` dengan `emissive` warna emas.
- **Peti harta karun:** Dua `BoxGeometry` (badan + tutup) dengan pivot di engsel agar tutup bisa dianimasikan membuka.
- **Kotak alat pancing (tackle box):** Mirip peti tapi lebih kecil, warna merah/oranye khas tackle box.
- **Langit:** Gradient sky via `THREE.Mesh` besar (sphere/box) dengan shader gradient sunset (oranye → pink → ungu tua), atau lebih sederhana: CSS gradient background di belakang canvas transparan untuk bagian langit statis, dikombinasikan dengan fog Three.js (`THREE.FogExp2`) untuk kedalaman.
- **Partikel:** `THREE.Points` untuk kunang-kunang (glow kecil melayang) dan splash air saat cast/reel.
- **Lighting:** `HemisphereLight` (langit-tanah) sebagai ambient, `DirectionalLight` warna hangat oranye sebagai "matahari sunset" dengan shadow di-nonaktifkan atau minimal (demi performa mobile).

**Palet warna:** oranye sunset (#FF9E5E), ungu senja (#5B4B8A), biru danau (#2E6E7E), emas aksen (#E8C170), krem/putih untuk teks card (#FFF8ED).

---

## 7. Responsivitas & Performa (WAJIB, karena mayoritas tamu akan buka dari HP)

- **Pixel ratio:** cap `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`.
- **Resize handler:** update `camera.aspect`, `camera.updateProjectionMatrix()`, `renderer.setSize()` pada event `resize` (dan `orientationchange` untuk mobile).
- **Deteksi mobile:** gunakan `matchMedia('(max-width: 768px)')` atau deteksi UA sederhana untuk menurunkan jumlah partikel (mis. 150 di desktop → 50 di mobile), menonaktifkan post-processing/bloom di mobile, dan mengurangi segment geometry (subdivisions) pada air.
- **Geometry budget:** Total polycount scene sebaiknya di bawah ~50k triangles agar tetap smooth di HP mid-range.
- **Lazy init:** Jangan render/init Three.js sebelum user berinteraksi dengan tombol "Mulai" pertama jika ingin hemat resource saat idle di landing (opsional).
- **Touch events:** pastikan semua tombol punya `touch-action: manipulation` di CSS agar tidak ada delay tap 300ms, dan area tap minimal 44x44px (guideline aksesibilitas mobile).
- **Orientasi:** desain agar tetap layak dilihat di portrait (mayoritas HP) — posisikan UI card di bagian bawah layar (thumb-friendly), scene 3D mengisi area atas/tengah.
- **Fallback:** jika `WebGL` tidak didukung (jarang, tapi cek), tampilkan pesan sopan + fallback versi teks statis undangan (progressive enhancement, bukan wajib tapi disarankan untuk safety net).
- **Loading state:** tampilkan loading screen sederhana (progress bar/logo) selama asset & shader compile, hindari layar putih kosong.

---

## 8. Detail Interaksi & Animasi (GSAP timeline contoh)

Contoh transisi kamera antar quest (pseudocode):

```js
function transitionCamera(targetPos, targetLookAt, duration = 2.2) {
  gsap.to(camera.position, {
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    duration,
    ease: "power2.inOut",
  });
  gsap.to(cameraLookAtTarget, {
    x: targetLookAt.x,
    y: targetLookAt.y,
    z: targetLookAt.z,
    duration,
    ease: "power2.inOut",
    onUpdate: () => camera.lookAt(cameraLookAtTarget),
  });
}
```

Contoh animasi buka peti (Quest 4):

```js
function openChest() {
  gsap.to(chestLid.rotation, {
    x: -Math.PI * 0.75,
    duration: 1.2,
    ease: "back.out(1.7)",
  });
  gsap.fromTo(
    glowLight,
    { intensity: 0 },
    { intensity: 3, duration: 0.6, delay: 0.8, yoyo: true, repeat: 1 },
  );
  spawnParticleBurst(chestPosition); // partikel emas naik ke atas
}
```

---

## 9. Konten Lengkap (Bahasa Indonesia) — untuk `content.js`

```js
export const content = {
  intro: {
    eyebrow: "Undangan Pernikahan",
    title: "ALN & Alfiana",
    subtitle: "Sebuah perjalanan menuju janji suci",
    cta: "Mulai Petualangan",
  },
  meet2020: {
    body: "Tahun 2020, di bangku perkuliahan, dua sahabat pertama kali bertemu. Belum ada percikan istimewa — hanya sapaan singkat dan jalan yang sesekali bersinggungan.",
    cta: "Lanjutkan",
  },
  reconnect2023: {
    prompt: "Lempar Kail",
    body: "Tahun 2023, takdir mempertemukan kembali. Dari yang dulunya sekadar teman, tumbuh cerita baru — perlahan namun pasti, benih itu berkembang menjadi kisah cinta.",
    cta: "Lanjutkan",
  },
  proposal2025: {
    prompt: "Tarik Pancing",
    body: 'September 2025. Tangkapan paling berharga bukanlah ikan — melainkan sebuah jawaban "Ya" atas sebuah pertanyaan penting. Lamaran pun terucap, dan janji untuk melangkah bersama semakin nyata.',
    cta: "Buka Peti Harta Karun",
  },
  eventReveal: {
    prompt: "Buka Peti",
    date: "28 November 2026, pukul 10:00 WIB",
    body: "Kami akan mengucap janji suci di hadapan-Nya.",
    venueName: "Graha Tirta Siliwangi",
    venueAddress:
      "Jl. Lombok No.10, Merdeka, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40113",
    mapsCta: "Lihat Lokasi",
    cta: "Lanjutkan ke Kru",
  },
  rsvp: {
    body: "Kehadiran serta doa restu Bapak/Ibu/Saudara/i akan menjadi kebahagiaan dan kehormatan besar bagi kami untuk mengarungi babak baru ini.",
    subBody:
      "Konfirmasi kehadiranmu dan tandai kalender agar tak ketinggalan momen bahagia kami.",
    cta: "Konfirmasi Kehadiran (RSVP)",
    rsvpUrl: "https://calendar.app.google/aMVDdhrgRK4zBm49A",
    closing: "Sampai jumpa di 28 November 2026 — Salam hangat, ALN & Alfiana.",
  },
};
```

Link Google Maps untuk tombol "Lihat Lokasi" (generate sekali, hardcode sebagai konstanta):

```
https://www.google.com/maps/search/?api=1&query=Graha+Tirta+Siliwangi+Jl.+Lombok+No.10+Merdeka+Kec.+Sumur+Bandung+Kota+Bandung+Jawa+Barat+40113
```

---

## 10. Setup & Instalasi

```bash
npm create vite@latest wedding-invitation -- --template vanilla
cd wedding-invitation
npm install three gsap
npm run dev
```

`package.json` scripts penting:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Build produksi: `npm run build` → hasil di folder `dist/` → drag-drop ke Netlify/Vercel, atau `vercel deploy` via CLI.

---

## 11. Checklist Sebelum Rilis

1. Test di HP asli (Android + iOS Safari) — Safari sering paling ketat soal WebGL memory & autoplay.
2. Cek waktu load pertama (target < 3 detik di koneksi 4G biasa) — kompres/hindari asset besar.
3. Pastikan tombol RSVP benar-benar membuka link Google Calendar yang tepat: `https://calendar.app.google/aMVDdhrgRK4zBm49A`.
4. Cek semua teks Bahasa Indonesia bebas typo dan format tanggal/alamat sudah pas.
5. Uji orientasi portrait & landscape.
6. Uji dengan koneksi lambat (throttle di DevTools) — pastikan ada loading indicator.
7. Tambahkan meta tag Open Graph agar tampil bagus saat link dibagikan di WhatsApp/grup kolega: judul statis `"Undangan Pernikahan Alfiana & Aln"`, deskripsi singkat, dan gambar preview + favicon yang **di-generate sendiri (bukan diunduh dari sumber luar)** untuk menghindari isu copyright — lihat §6 untuk arahan visual/palet yang bisa dipakai sebagai referensi generate.
8. Aksesibilitas dasar: kontras teks cukup, tombol punya area tap besar (≥44x44px), objek 3D interaktif (§5.3) punya affordance visual + label yang jelas karena klik objek bersifat wajib bukan opsional.
9. Uji tombol "Lewati ke Detail Acara" di Landing — pastikan loncat langsung ke Quest 4 dengan transisi kamera yang tetap mulus (bukan cut instan).
10. Uji parameter `?to=Nama+Tamu` — cek encoding spasi (`+`), nama panjang/karakter aneh tidak merusak layout, dan fallback tanpa parameter menampilkan sapaan generik.

---

## 12. Opsional / Nice-to-have (jika ada waktu lebih)

- Background music toggle (lagu instrumental lembut, default mute, tombol mute/unmute — banyak browser mobile block autoplay audio, jadi harus trigger dari interaksi user).
- Countdown timer menuju 28 November 2026 di Quest 4.
- Share button (copy link / share ke WhatsApp) di layar akhir.
- Dark/sunset mode transition otomatis mengikuti progres quest (langit makin gelap seiring cerita mendekati hari-H, lalu terang lagi di RSVP sebagai simbol harapan baru).
