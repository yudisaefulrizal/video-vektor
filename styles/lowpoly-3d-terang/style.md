---
deskripsi: Lanskap 3D low-poly: bidang segi tiga datar berwarna cerah, pulau, pegunungan, dan laut dengan kabut lembut.
---
Gaya 3D yang dirender dengan Three.js (`@remotion/three`, `ThreeCanvas`). Semua objek dibangun dari primitif beresolusi rendah dan medan yang dihitung dari rumus, tanpa model atau tekstur luar.

- Bahan: `meshStandardMaterial` dengan `flatShading`, roughness 0,85-1, metalness 0. Setiap permukaan harus terbaca sebagai bidang datar segi tiga atau segi banyak. Tanpa normal halus, tekstur gambar, atau garis tepi. Air boleh lebih licin (roughness ±0,3) supaya facet-nya berkilau terkena matahari.
- Bentuk: primitif berpoligon sedikit: cone 4-6 segmen, silinder 6 segmen, icosahedron detail 0-1, kotak. Tanpa bevel dan tanpa sudut membulat. Medan dibuat dari grid yang titik-titiknya digeser acak (jitter) lalu diwarnai per segitiga menurut ketinggian rata-ratanya. Semua posisi acak memakai angka acak bersemi (seeded) supaya sama di setiap frame dan setiap render.
- Warna: segar dan cerah. Langit #6FBDEB ke horizon #E3F4FB, air #47BDE8, pasir #F3D9A4, rumput #9ED86B dan #62BF5C, hutan #3FA463, batu #8D99AE, salju #FFFFFF, matahari #FFD84D, aksen koral #F26B5B, dinding krem #FFE9C7, pintu #5B6FD6, kayu #A9744F, tinta #2B3A55. Kecerahan tiap bidang medan divariasikan acak ±6% agar facet terlihat. Maksimal tiga warna dominan per adegan di luar alam.
- Cahaya: satu lampu arah hangat (#FFF3D6) dari kanan-atas dan satu hemisphere light (langit putih, tanah biru muda). Tanpa peta bayangan. Matikan tone mapping (`flat`) supaya warna palet tidak bergeser. Sisi yang menghadap matahari kira-kira 1,1 kali warna dasar dan sisi membelakangi sekitar 0,5 kali.
- Kamera: perspektif (fov 45), sedikit di atas objek utama dan menatap turun sekitar 14° supaya langit dan pegunungan terlihat. Gerak hanya orbit sangat pelan (kurang dari 8° selama satu bidikan). Tanpa goyang atau gerak cepat.
- Kedalaman: kabut (`fog`) berwarna sama dengan horizon sehingga benda jauh memudar. Tiga lapis: depan (pantai, perahu), tengah (pulau, hutan, bangunan), belakang (pegunungan bersalju, awan, matahari).
- Komposisi: satu pulau atau lanskap utama dengan satu titik fokus (pondok, kota mini, dan sebagainya), dikelilingi benda pengisi yang lebih kecil (pohon, batu, perahu). Objek fokus tidak ada di tepi bingkai.
- Karakter: tidak wajib. Bila ada, makhluk atau orang low-poly dari bentuk facet, wajah hanya titik mata kecil.
- Teks di layar: tidak ada teks 3D. Bila perlu, teks diletakkan di lapisan HTML di atas kanvas dengan Lato 900 berwarna #1F3B57.
- Gerak: daratan naik dari permukaan laut tanpa membal, gunung menyusul bergiliran, lalu pohon dan benda kecil tumbuh dengan spring yang membal (selang 1-2 frame untuk benda kecil, 4-6 frame untuk benda besar). Setelah semuanya jadi, tersisa gerak hidup: ombak (titik air bergelombang), asap, awan bergeser, burung terbang melingkar, perahu bergoyang, pohon bergoyang kurang dari 2°. Keluar: seluruh dunia mengecil dan tenggelam dalam sekitar 10 frame. Diam 15-20 frame di antara rangkaian gerak.
- Performa: `dpr={1}`, tanpa peta bayangan, kurang dari 200 mesh, geometri medan dibuat sekali (`useMemo`), geometri air dibuang saat diganti.
- Hindari: normal halus (smooth shading) pada objek utama, bevel, tekstur, bayangan keras, glow berlebihan, warna di luar palet, dan model 3D dari luar.
