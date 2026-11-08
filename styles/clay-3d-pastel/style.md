---
deskripsi: 3D tanah liat berwarna pastel: bentuk bulat gembung, cahaya lembut, bayangan halus, dan gerak bergoyang seperti stop-motion.
---
Gaya 3D yang dirender dengan Three.js (`@remotion/three`, `ThreeCanvas`), tanpa model atau tekstur luar. Semua objek dibangun dari primitif.

- Bahan: seperti tanah liat. `meshStandardMaterial` dengan roughness 0.85-1 dan metalness 0. Tanpa kilap, pantulan, atau tekstur gambar. Tanpa garis tepi.
- Warna: pastel hangat yang lembut. Palet: latar #F6EFE6, lantai #EBDDCB, biru #8EC5E8, merah muda #F4A9B8, kuning #F7D488, hijau #9ED6B0, ungu #C3B1E1, putih tulang #FFF8EE, mata #3B3A4A. Satu warna dominan per adegan, warna lain sebagai pendukung.
- Bentuk: bulat dan gembung. Bola, kapsul, silinder dan kotak dengan sudut sangat membulat (RoundedBox, radius besar). Tanpa sudut tajam dan tanpa detail kecil. Proporsi dibesar-besarkan (kepala besar, badan pendek).
- Karakter: makhluk tanah liat dari bola badan dan bola kepala, tanpa leher, dengan mata bulatan hitam kecil, pipi merah muda, dan mulut garis melengkung. Tangan dan kaki berupa bola atau kapsul pendek. Tanpa rambut dan pakaian rumit. Tokoh yang sama identik di semua adegan.
- Cahaya: satu lampu utama hangat dari atas-depan-kiri dengan bayangan lembut (shadow radius besar), satu lampu isi biru muda dari kanan, dan cahaya ambient tinggi. Hasilnya lembut, kontras rendah, tanpa sorot keras.
- Kedalaman: lantai halus yang menangkap bayangan, latar polos hangat, objek di tiga lapis jarak. Bayangan di bawah setiap objek wajib ada agar terasa menapak.
- Kamera: perspektif sempit (fov 30-35) dari sedikit atas. Gerak kamera pelan: dolly 5% atau orbit kecil. Tanpa gerak cepat.
- Teks di layar: tidak ada teks 3D. Teks bila perlu ditaruh di lapisan HTML di atas kanvas dengan Lato 900, warna #3B3A4A.
- Gerak: masuk dengan skala spring yang membal (dari 0 ke 1 dengan sedikit melewati), lalu bergoyang halus seperti stop-motion (rotasi ±3 derajat, skala napas ±2%). Tokoh berkedip berkala. Elemen berurutan selang 4-6 frame. Keluar cepat (sekitar 10 frame). Diam 15-20 frame di antara gerakan.
- Performa: pakai `dpr={1}`, tanpa pasca-pemrosesan, dan jumlah lampu berbayang maksimal satu.
- Hindari: bahan mengilap atau logam, tekstur gambar, neon, warna jenuh keras, bayangan keras, dan model 3D dari luar.
