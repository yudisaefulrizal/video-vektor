---
deskripsi: Diorama 3D isometrik: pulau melayang berisi blok bangunan, jalan, dan pepohonan berwarna cerah dengan bayangan lembut.
---
Gaya 3D yang dirender dengan Three.js (`@remotion/three`, `ThreeCanvas`) memakai kamera ortografis isometrik sejati. Semua objek dibangun dari primitif, tanpa model atau tekstur luar.

- Kamera: ortografis, diletakkan di (10, 10, 10) menatap pusat adegan, sehingga sumbu x, y, z tampak sama panjang (sudut 35,26°). Tanpa perspektif. Kamera tidak bergerak. Yang boleh hanya zoom pelan sampai 5% selama satu bidikan.
- Bentuk: blok bersudut membulat kecil (radius 0,06-0,15) dengan permukaan atas rata dan sisi sejajar sumbu. Detail dibuat dari balok tipis (jendela, pintu, kanopi, atap). Bola dan silinder hanya untuk pohon, semak, koin, roda, dan orang. Hindari lengkungan besar dan bentuk organik.
- Bahan dan cahaya: `meshLambertMaterial`, tanpa kilap, pantulan, tekstur gambar, atau garis tepi. Satu lampu arah dari (4, 12, 8) dengan bayangan lembut ditambah cahaya ambient, sehingga setiap balok punya tiga tingkat terang yang jelas: sisi atas paling terang, sisi kiri (+z) sedang, sisi kanan (+x) paling gelap. Matikan tone mapping (`flat`) supaya warna palet tidak bergeser.
- Warna: cerah dan bersih. Latar gradasi vertikal #EAF3FC ke #D6E6F6. Palet: rumput #BFE3C8, tanah #D9B99B dan #C4A17F, dinding #F6F8FB dan krem #FFF1E0, biru utama #5B8DEF, kaca #A9CBFF, oranye #FF9F5A, kuning #FFD166, merah muda #F28DA6, jalan #6F7C93, trotoar #E9EDF3, tinta #2B3A55, daun #7BC99A dan #5FB583. Maksimal tiga warna dominan per adegan.
- Komposisi: satu diorama utama berupa pulau melayang bersusun di tengah bingkai, dengan bayangan lembut di bawahnya dan awan kecil mengambang. Satu bangunan atau objek pusat untuk satu ide, dikelilingi benda pendukung yang lebih kecil. Pelaku berupa orang kecil dari kapsul dan bola, tanpa wajah dan tanpa pakaian rumit.
- Teks di layar: tidak ada teks 3D. Bila perlu, teks diletakkan di lapisan HTML di atas kanvas dengan Lato 900 berwarna #2B3A55.
- Gerak: pulau muncul lebih dulu, lalu objek lain tumbuh dari tanah dengan skala spring yang membal, selang 4-6 frame, urut dari yang besar ke yang kecil. Kendaraan dan orang hanya bergerak lurus sejajar sumbu x atau z, dan mengecil di ujung jalur supaya tidak hilang mendadak. Benda melayang (koin, awan) naik-turun halus. Seluruh diorama melayang pelan (±0,12 satuan). Keluar: tenggelam dan mengecil dalam sekitar 10 frame. Diam 15-20 frame di antara rangkaian gerak.
- Performa: `dpr={1}`, satu lampu berbayang, peta bayangan 2048, tanpa pasca-pemrosesan.
- Hindari: kamera perspektif atau sudut selain isometrik sejati, objek bergerak diagonal, bayangan keras, tekstur, neon, tokoh berwajah, dan model 3D dari luar.
