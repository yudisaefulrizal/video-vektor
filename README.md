# Video Vektor

Pipeline judul → naskah → audio → animasi Remotion + Three.js. Setiap proyek memakai folder hasil sendiri dan hanya menyimpan hasil terbaru. Renderer baru membaca aset dan keyframe dari rencana animasi, sehingga judul baru tidak membutuhkan perubahan kode adegan.

## Aplikasi studio

```bash
npm start
```

Buka **http://localhost:8077**. `npm run dev` membuka aplikasi yang sama. Port default 8077 dapat diubah melalui `PORT` di `.env`. Untuk membuka editor Remotion lama, gunakan `npm run studio`.

- **Studio:** masukkan judul, pilih mulai sekarang atau jadwalkan dalam WIB, dan pantau tujuh tahap pipeline beserta jumlah frame render yang selesai.
- **Jadwal:** lihat antrean, ubah waktu mulai, batalkan pekerjaan yang belum berjalan, atau lanjutkan pekerjaan yang terhenti.
- **Hasil:** putar video final dan unduh video, narasi, musik, audio final, naskah, serta subtitle. Hasil yang sudah ada di `hasil/` langsung terbaca.

Antrean tersimpan di `.cache/video-pipeline/studio/jobs.json`. Jadwal diproses satu per satu **selama aplikasi berjalan**; jadwal yang sudah lewat akan diproses saat aplikasi dibuka kembali. Pipeline dari terminal memakai kunci proses yang sama, sehingga antrean studio menunggu hingga proses tersebut selesai. Jika aplikasi ditutup saat produksi berjalan, pekerjaan dapat dilanjutkan dari naskah dan checkpoint tersimpan melalui tombol **Lanjutkan**.

Status UI berasal dari `.cache/video-pipeline/projects/<id>/status.json`, yang ditulis langsung oleh pipeline. Pemanggilan AI tetap menggunakan login ChatGPT di Codex CLI, tanpa API key. Aplikasi memakai server lokal Node.js dan aset lokal, tanpa proses build UI tambahan.

## Mulai dari judul

Login Codex CLI melalui akun ChatGPT satu kali:

```bash
codex login
codex login status
```

Pipeline memakai `codex exec` dengan login ChatGPT yang tersimpan, tanpa API key. Model mengikuti konfigurasi CLI. Jika diperlukan, salin `.env.example` ke `.env` untuk mengatur `CODEX_BIN`, `CODEX_MODEL`, atau suara narasi.

```bash
npm run video -- "Dampak negatif buang sampah ke sungai"
```

Urutan otomatisnya:

1. Membuat ID dari judul dan folder `hasil/<id-proyek>/`.
2. Membaca `skill/pembuat-naskah.md`, mengisi input `Tema:` di memori, dan memanggil AI. File skill tidak diedit.
3. Memeriksa kontrak JSON dan menyimpan array naskah ke `hasil/<id-proyek>/naskah.json` **sebelum** audio atau video dibuat.
4. Membuat narasi dan timing kata di cache khusus proyek.
5. Menerjemahkan `motion_description` menjadi aset SVG serta keyframe gerak, kamera, teks selektif, dan objek Three.js yang relevan.
6. Merender rencana tersebut menggunakan renderer tetap, mengekspor audio, dan memeriksa kandidat hasil.
7. Mengganti hasil terbaru setelah pemeriksaan berhasil, lalu membersihkan file sementara.

Naskah mengikuti batas skill: maksimal lima unit dengan properti berurutan `audio_text`, `key_text`, `motion_description`; `key_text` dapat `null`. Jumlah shot visual tidak dikunci ke jumlah unit naskah. Shot dapat melintasi batas kalimat dan harus mempunyai aksi objek.

Rencana animasi memakai JSON Schema melalui [`codex exec --output-schema`](https://developers.openai.com/codex/noninteractive). Sesi generasi read-only dan ephemeral; direktori sementara dibersihkan setelahnya. Naskah tetap berupa array JSON tanpa objek pembungkus sesuai skill. Aset berupa SVG statis; kode JavaScript atau URL eksternal dari model tidak dieksekusi.

## Melanjutkan atau memperbarui proyek

```bash
# Lanjutkan naskah, audio, rencana, atau render yang terputus:
npm run render -- --project dampak-negatif-buang-sampah-ke-sungai

# Perbarui hanya penyutradaraan/aset/keyframe, memakai naskah yang sama:
npm run render -- --project dampak-negatif-buang-sampah-ke-sungai --replan

# Buat ulang naskah dan rencana tanpa menyimpan versi lama:
npm run video -- "Dampak negatif buang sampah ke sungai" --regenerate

# Render gambar ulang tanpa membuat naskah baru:
npm run render -- --project dampak-negatif-buang-sampah-ke-sungai --force
```

Judul yang sama memakai folder yang sama dan secara default memakai naskah yang sudah tersimpan. Judul berbeda mendapat folder berbeda. Gunakan `--id nama-khusus` jika diperlukan. `npm run render` tanpa argumen melanjutkan proyek generik terakhir setelah pernah ada proyek yang selesai; sebelum itu, perintah tersebut tetap mendukung video kucing lama.

Cache, audio kerja, rencana, laporan, dan checkpoint terpisah per proyek di `.cache/video-pipeline/projects/<id>/`. File props dikirim ke Remotion melalui `--props` dan aset melalui `--public-dir`; pipeline tidak menimpa `src/Story.tsx`, `src/edit.ts`, atau timeline proyek lama untuk membuat judul baru. Jika pemeriksaan menemukan gerakan membeku, pipeline mencoba menyusun ulang rencana animasi satu kali secara otomatis, memakai naskah yang sama. Kegagalan berikutnya menghentikan publish dan mempertahankan hasil sebelumnya.

Perintah bantu untuk proyek generik:

```bash
npm run render:preview -- --project dampak-negatif-buang-sampah-ke-sungai
npm run review -- --project dampak-negatif-buang-sampah-ke-sungai
npm run verify -- --project dampak-negatif-buang-sampah-ke-sungai
npm run clean -- --project dampak-negatif-buang-sampah-ke-sungai
```

## Kompatibilitas proyek kucing lama

Video kucing yang telah disetujui memakai 20 shot yang ditulis sebelumnya, dengan hasil sekitar 67 detik, 1920 × 1080, 30 fps. Perintah dan penjelasan di bawah tanpa `--project` tetap tersedia untuk alur lama.

## Satu perintah untuk hasil final

```bash
npm run render
```

Pipeline menjalankan urutan berikut:

1. Menyiapkan narasi dari cache, memperbarui timing/SRT, dan membuat musik.
2. Memeriksa TypeScript, kelengkapan naskah, dan jeda narasi.
3. Merender gambar dalam potongan 200 frame; melanjutkan potongan yang sudah valid.
4. Menggabungkan gambar dan audio ke **kandidat sementara**.
5. Memeriksa codec, resolusi, jumlah frame, durasi, dekode, dan gerakan. Membuat poster, storyboard, dan laporan kualitas.
6. Menyimpan seluruh hasil final setelah pemeriksaan lolos, lalu membersihkan file kerja dan checkpoint yang selesai.

Hasil sebelumnya tetap tersimpan jika persiapan, render, atau pemeriksaan gagal. Jika pemasangan hasil final mengalami kesalahan I/O, pipeline mengembalikan berkas sebelumnya. Kunci proses mencegah render dan pembersihan berjalan bersamaan.

Input dan hasil dicatat memakai checksum di `.cache/video-pipeline/build-manifest.json`. Perintah yang sama tidak merender ulang jika hasil final masih cocok. Jika gambar tetap sama tetapi audio berubah, pipeline memakai gambar yang sudah terverifikasi. Jika hanya poster atau pemeriksaan yang perlu diperbarui, file video dipertahankan tanpa penggabungan atau enkode ulang audio. Untuk memaksa render baru:

```bash
npm run render -- --force
```

## Pembersihan otomatis

Semua pekerjaan baru memakai `.vtmp/r-*/`, termasuk temporary directory milik Chromium, bundle Remotion, FFmpeg, dan gambar perantara. Jalurnya sengaja pendek untuk batas panjang socket Chrome. Setiap folder memiliki penanda kepemilikan proyek. Folder kerja dibersihkan setelah proses selesai atau gagal; proses yang terhenti paksa dapat meninggalkan folder yang akan dibersihkan pada render sukses berikutnya atau melalui `npm run clean`.

Potongan yang sudah valid disimpan di `.cache/video-pipeline/checkpoints/` selama render belum selesai. Setelah gagal, jalankan kembali `npm run render`. Potongan rusak dan potongan setelah celah akan dirender ulang. Checkpoint yang berasal dari input gambar berbeda dibuang otomatis.

```bash
npm run clean:dry    # Lihat daftar file sementara yang bisa dibersihkan
npm run clean        # Bersihkan file kerja; simpan checkpoint render gagal
npm run clean:cache  # Bersihkan file kerja sekaligus semua checkpoint
```

Pembersihan dibatasi pada folder kerja proyek dan nama file perantara lama yang dikenali. Setelah hasil terbaru lolos validasi, versi lama dan alias video berlabel versi dibuang. Proyek hanya menyimpan satu hasil terbaru. Cadangan selama penggantian bersifat sementara dan langsung dibersihkan setelah penggantian berhasil. Sumber, font, audio yang digunakan, `.venv`, `node_modules`, serta temporary directory global tetap dipertahankan.

## Hasil yang disimpan

Satu proyek memakai satu folder hasil, tanpa versi lama:

```text
hasil/kucing-tidak-berguna/
├── video.mp4
├── narasi.wav
├── musik.wav
├── audio-final.wav
├── naskah.json
└── subtitle.srt
```

`narasi.wav` berisi suara bersih dengan timing yang sama seperti video. `musik.wav` berisi musik/efek pada level yang dipakai di video. `audio-final.wav` adalah audio yang diambil dari video final. Ketiganya WAV stereo 48 kHz.

Poster, storyboard, laporan kualitas, dan manifest internal disimpan di `.cache/video-pipeline/`, terpisah dari folder hasil. Audio per paragraf di `public/audio` tetap menjadi aset kerja Remotion dan cache TTS; hasil audionya sudah tersedia lengkap dalam folder proyek di atas.

## Pratinjau dan pemeriksaan

```bash
npm run studio          # Remotion Studio, pilih CeritaKucing
npm run render:preview  # Video 960 × 540 dengan audio
npm run still           # Poster dari sumber
npm run storyboard      # Storyboard dari sumber
npm run review          # Periksa video final dan buat kontak dari hasil dekode
npm run verify          # Periksa metadata video final
npm test                # Uji keselamatan cleanup, kegagalan publish, resume, lock, dan interupsi
```

Perintah poster, storyboard, review, dan preview menyimpan hasil pemeriksaannya di `.cache/video-pipeline/reports/` dan memakai folder kerja sementara yang dibersihkan otomatis. `CeritaKucingVisual` adalah komposisi internal untuk merender potongan gambar tanpa mengunduh audio berulang kali. `npm run assemble` menjalankan pipeline yang sama, tetapi berhenti jika gambar lengkap belum tersedia.

## Persiapan lingkungan

Memerlukan Node.js 22 atau lebih baru, Codex CLI yang sudah login, Google Chrome, Python 3, dan FFmpeg/ffprobe.

```bash
git clone https://github.com/yudisaefulrizal/video-vektor.git
cd video-vektor
npm ci
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Browser dikonfigurasi di `remotion.config.ts` (`/usr/bin/google-chrome`). Renderer standar adalah `angle`. Jika diperlukan:

```bash
REMOTION_GL=swangle npm run render -- --force
```

Font disertakan dalam repositori beserta lisensinya. Narasi, musik, video final, cache, dan antrean lokal dibuat saat pipeline dijalankan dan tidak diunggah ke repositori. Edge TTS memerlukan internet ketika narasi belum tersedia, teks berubah, atau cache audionya tidak valid. Cache narasi mencocokkan teks, suara, rate, dan checksum; tidak perlu menghapus MP3 secara manual. Narasi memakai `id-ID-ArdiNeural`. Musik dan ilustrasi dibuat oleh pipeline; aset Kurzgesagt tidak digunakan.

## Mengubah isi proyek kucing lama

Edit `naskah.json`, lalu jalankan `npm run render`. Untuk perubahan cerita, sesuaikan juga batas shot di `src/edit.ts` dan penyutradaraan di `src/Story.tsx`. Pembuatan timing otomatis tidak menggambar ulang cerita.

- `src/Film.tsx`: penyambungan shot, audio, takarir.
- `src/edit.ts`: batas frame dan aksi 20 shot.
- `src/Story.tsx`: kamera, lingkungan, gerakan, dan sambungan adegan.
- `src/components/Actors.tsx`: gerak karakter dan tangan.
- `src/components/Earth.tsx`: globe Three.js.
- `scripts/render.mjs`: alur render, cache, pemulihan, validasi, publish, cleanup.
- `scripts/lib/`: operasi berkas yang dibatasi, lock, proses anak, dan pemeriksaan media.

## Modul pipeline judul

- `scripts/video.mjs`: input judul, ID, resume, regenerate, dan pemilihan jalur.
- `scripts/run-project.mjs`: seluruh tahapan produksi untuk proyek dinamis.
- `scripts/lib/generation.mjs`: pemanggilan skill naskah dan penyutradaraan otomatis.
- `scripts/lib/contracts.mjs`: kontrak naskah, SVG, keyframe, dan kompilasi shot ke timing audio.
- `scripts/lib/ai.mjs`: Codex CLI melalui login ChatGPT, JSON Schema, perbaikan format, dan pembersihan sementara.
- `src/generic/`: renderer vektor dan ekstrusi SVG Three.js yang tidak bergantung pada topik.
- `scripts/lib/project-review.mjs`: pemeriksaan narasi, dekode, kontak shot, dan deteksi gerakan membeku.
