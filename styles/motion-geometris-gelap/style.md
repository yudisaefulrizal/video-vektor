---
deskripsi: Motion graphics geometris bergaya modern, latar gelap, satu warna utama, dan gerak berbasis spring.
---
Gaya ini mengadaptasi prinsip gerak dan desain dari haidrrrry/claude-remotion-skill (MIT), diterapkan pada ilustrasi vektor SVG.

- Garis: hampir tidak ada garis luar. Bentuk berupa bidang rata. Garis tipis (4px, ujung bulat) hanya untuk penghubung, sumbu, atau lintasan.
- Warna: satu dasar gelap, SATU warna utama, satu aksen, dan netral. Pembagian 60/30/10 (dasar/permukaan/utama). Palet: dasar #0A0A0F, permukaan #12121A, utama #7C3AED, aksen #22D3EE, teks #F4F4F5, teks redup #A1A1AA. Warna utama hanya pada SATU elemen per frame, untuk mengarahkan mata. Glow (drop-shadow berwarna utama) hanya pada elemen itu.
- Bentuk: lingkaran, persegi membulat (rx besar), kapsul, dan garis. Tanpa sudut tajam dan tanpa detail kecil. Satu ide diwakili satu bentuk atau satu kelompok bentuk sederhana, misalnya bilah untuk jumlah, lingkaran untuk entitas, panah garis untuk arah.
- Karakter: tidak memakai tokoh bergambar. Pelaku diwakili ikon geometris (lingkaran + kapsul) tanpa wajah.
- Kedalaman: datar, dengan tiga lapis (latar, tengah, depan) yang bergeser berbeda kecepatan (0.3 / 0.6 / 1). Latar tidak boleh polos: beri dua lingkaran besar buram (blur) berwarna utama dan aksen pada opasitas rendah yang bergerak pelan.
- Teks di layar: huruf tebal (Lato 900), rapat (letterSpacing -0.03em), maksimal satu kata disorot dengan warna utama per kalimat. Angka berupa penghitung animasi dengan tabular-nums. Teks hanya bila memperjelas bentuk, tidak menggantikannya.
- Komposisi: satu fokus per adegan, di tengah 75% bingkai. Elemen baru muncul minimal tiap 90 frame.
- Gerak:
  - Masuk dengan spring: fade + naik 40px + skala 0.94 ke 1. Tidak pernah fade saja atau muncul mendadak.
  - Berurutan: elemen sejenis masuk bergiliran, selang 3-6 frame.
  - Keluar lebih cepat daripada masuk (sekitar 10 frame berbanding 20).
  - Ritme: gerak cepat, diam 15-20 frame, lalu gerak berikutnya. Gerak terus-menerus terlihat amatir.
  - Elemen yang tampil lebih dari 2 detik bernapas halus (skala ±1.5%, melayang ±3px).
  - interpolate selalu memakai clamp di kedua sisi.
- Hindari: lebih dari satu elemen ber-glow dalam satu frame, latar polos, gradasi pelangi, bayangan keras, tokoh berwajah, teks panjang, dan warna di luar palet.
