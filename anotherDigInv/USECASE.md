# Use Case: Konsep Interaksi "Click-to-Advance"

Dokumen ini menjelaskan bagaimana tamu undangan sebenarnya mengalami situs ini, berdasarkan spec di `DEV.md`. Tujuannya: menyamakan pemahaman tentang model interaksi sebelum masuk ke implementasi.

---

## 1. Siapa yang pakai, dan dari mana

- **Aktor:** Tamu undangan pernikahan, menerima link personal lewat WhatsApp (`https://domain.com/?to=Budi+Santoso`).
- **Device:** ~80% dari HP, sisanya desktop. Kemungkinan besar dibuka sambil scroll WA, jaringan 4G biasa, sering di tempat ramai/terburu-buru.
- **Motivasi:** Sebagian besar tamu ingin tahu **tanggal & lokasi acara** secepat mungkin. Sebagian kecil (biasanya yang dekat dengan mempelai) mau menikmati cerita.

Spec sudah mengantisipasi ini lewat tombol "skip to detail" (§11 poin 8) — use case ini menegaskan kenapa itu penting, bukan sekadar nice-to-have.

---

## 2. Alur utama (happy path)

```
[Buka link WA]
      │
      ▼
[Landing / Quest 0]  "Yth. {Nama Tamu}" + judul + tombol "Mulai Petualangan"
      │  (klik tombol)
      ▼
[Quest 1: Dermaga 2020]  baca cerita pertemuan → klik "Lanjutkan"
      │  kamera GSAP-tween ke titik berikutnya
      ▼
[Quest 2: Melempar Kail 2023]  klik "Lempar Kail" → animasi cast → baca cerita → "Lanjutkan"
      │
      ▼
[Quest 3: Tangkapan 2025]  klik "Tarik Pancing" → animasi reveal cincin → baca cerita → "Buka Peti Harta Karun"
      │
      ▼
[Quest 4: Peti Harta Karun]  klik "Buka Peti" → reveal tanggal & lokasi acara
      │   ├─ tombol sekunder "Lihat Lokasi" → buka Google Maps (tab baru)
      │   └─ tombol "Lanjutkan ke Kru"
      ▼
[Quest 5: RSVP]  baca ajakan → klik "Konfirmasi Kehadiran (RSVP)" → buka Google Calendar (tab baru)
```

Setiap panah "klik → lanjut" adalah **satu-satunya bentuk input** dari user selain menonton animasi. Tidak ada drag, swipe-to-look, atau navigasi bebas — kamera selalu tahu persis ke mana harus bergerak karena posisinya sudah ditentukan di awal (`QuestController.js`).

---

## 3. Jalur alternatif (bukan happy path)

| Situasi | Perilaku yang diharapkan |
|---|---|
| Tamu buru-buru, tidak mau nonton cerita | Tombol kecil "Lewati ke Detail Acara" di landing/quest awal → loncat langsung ke Quest 4 (tanggal, lokasi, tombol RSVP) |
| Link dibuka tanpa parameter `?to=` (dibagikan ke grup umum) | Sapaan generik ("Yth. Bapak/Ibu/Saudara/i"), sisanya sama |
| HP tidak support WebGL / GPU lemah | Fallback teks statis (progressive enhancement) — tetap bisa lihat tanggal, lokasi, tombol RSVP tanpa scene 3D |
| Koneksi lambat | Loading screen dengan progress bar saat asset/shader compile, bukan layar putih kosong |
| Tamu reload di tengah quest | Kembali ke Quest 0 (tidak ada persistence state — sesuai §2 "semua state di client (JS memory)") |
| Tamu mau share link acara ke teman lain | Preview WA statis: "Undangan Pernikahan Alfiana & Aln" (OG tag tidak personalized, karena static site tanpa backend) |

---

## 4. Kenapa model ini (bukan free-roam), untuk konteks acara ini

- **Waktu tonton pendek**: tamu tidak datang untuk "main game", mereka datang untuk info + momen sentimental singkat. Linear flow menjamin semua tamu sampai ke info acara tanpa nyasar.
- **Tidak butuh belajar kontrol**: tidak ada onboarding "cara gerak" — cukup tap tombol, sama seperti scroll Instagram Story. Cocok untuk demografi tamu yang beragam usia/kebiasaan digital.
- **Performa terprediksi**: karena kamera & objek yang di-render pada satu waktu selalu terbatas (1 titik quest aktif), budget polygon/particle (§7, target <50k triangle) jauh lebih mudah dijaga di HP mid-range dibanding peta terbuka yang harus di-render luas.
- **Cerita tetap terarah**: 5 babak (2020 → 2023 → 2025 → hari-H → RSVP) adalah narasi kronologis yang justru kehilangan makna kalau dieksplorasi acak/keluar urutan.

---

## 5. Interaksi yang ADA vs TIDAK ADA

**Ada (sesuai spec):**
- Klik tombol UI (HTML overlay) untuk lanjut antar quest
- Klik/tap objek 3D tertentu untuk trigger animasi lokal (joran → cast, peti → buka) — via raycaster, tapi tetap di titik kamera yang sama, bukan berpindah tempat
- Tombol sekunder ke luar (Google Maps, Google Calendar) — membuka tab baru, bukan bagian dari scene 3D

**Tidak ada:**
- Pergerakan kamera/karakter oleh user (WASD, joystick, drag-to-orbit bebas)
- Peta terbuka yang bisa dijelajah di luar urutan quest
- Collision detection / batas area jelajah (tidak relevan karena tidak ada pergerakan bebas)
- Multiplayer atau state yang tersimpan antar sesi

---

## 6. Keputusan

- **Tombol "Lewati ke Detail Acara"**: hanya muncul di Landing (Quest 0). Setelah tamu klik "Mulai Petualangan", tidak ada jalan pintas lagi sampai ke Quest 4 — begitu masuk cerita, dianggap sudah komit menonton sampai selesai.
- **Interaksi objek 3D wajib**: klik langsung ke objek 3D (joran di Quest 2, ikan/tarikan di Quest 3, peti di Quest 4) adalah **satu-satunya** cara trigger animasi tersebut — bukan alternatif dekoratif dari tombol UI biasa. Konsekuensinya:
  - Raycaster + `pointerdown` jadi jalur utama, bukan opsional (ubah dari spec §5.3 yang tadinya menyarankan tombol UI sebagai cara utama).
  - Perlu affordance visual yang jelas supaya tamu tahu objek itu bisa diklik (mis. subtle glow/pulse/outline pada objek interaktif, plus label kecil seperti "Ketuk joran untuk melempar kail" agar tidak membingungkan tamu yang kurang familiar dengan game).
  - Hit area objek 3D di mobile harus cukup besar (raycast terhadap bounding box yang diperbesar dari mesh asli, bukan mesh presisi) supaya tap akurat di layar kecil — mesh joran/tali yang tipis butuh hit box lebih toleran dari visualnya.
  - Perlu fallback: kalau tamu tap berkali-kali di tempat salah tanpa progress (misal >5 tap gagal), tampilkan hint singkat mengarahkan ke objek yang benar (bantu aksesibilitas, tanpa mengubah aturan "wajib klik objek").
