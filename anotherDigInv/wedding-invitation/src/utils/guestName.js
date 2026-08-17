const MAX_LENGTH = 40;

// Parsing ?to=Nama+Tamu — URLSearchParams sudah decode "+" jadi spasi secara default.
// Nilai kembalian selalu plain string; caller WAJIB render via textContent, bukan innerHTML,
// supaya parameter URL tidak bisa dipakai untuk injeksi HTML/script.
export function getGuestName() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("to");
  if (!raw) return null;

  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;

  return trimmed.length > MAX_LENGTH ? trimmed.slice(0, MAX_LENGTH).trim() : trimmed;
}
