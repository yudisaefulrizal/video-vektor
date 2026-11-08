---
deskripsi: Infografis datar bergaya terang: bidang warna rata, ikon geometris, angka besar, dan grafik sederhana.
---
Gaya infografis explainer: data dan konsep dijelaskan lewat ikon, angka, dan grafik, bukan tokoh.

- Garis: tanpa garis luar pada bentuk. Garis hanya untuk sumbu, penghubung, dan panah: 6px, ujung bulat, warna tinta.
- Warna: latar krem #F7F5F0, tinta #1F2937, dan palet empat warna rata: biru #2563EB, oranye #F97316, hijau #10B981, kuning #FBBF24. Satu warna per bidang, tanpa gradasi dan tanpa bayangan. Satu warna aksen dominan per adegan, warna lain hanya pendukung. Makna warna konsisten sepanjang video (misal oranye selalu masalah, hijau selalu solusi).
- Bentuk: lingkaran, persegi membulat (rx 24), segitiga membulat, dan kapsul. Ikon dibangun dari 2-4 bentuk dasar, tanpa detail kecil. Satu konsep, satu ikon.
- Karakter: tidak ada tokoh berwajah. Orang diwakili ikon kepala (lingkaran) di atas badan (kapsul), tanpa wajah.
- Kedalaman: datar total. Boleh satu bidang lingkaran besar berwarna pastel (aksen 15% opasitas) di belakang fokus sebagai penanda ruang. Tanpa blur.
- Teks di layar: judul pendek (maks. 6 kata) dalam Lato 900 berukuran 96-120px, warna tinta, satu kata diberi warna aksen. Angka penting ditampilkan besar (160px+) dan dianimasikan sebagai penghitung dengan tabular-nums. Label ikon 40px Lato 400. Teks selalu mendampingi bentuk.
- Komposisi: tata letak grid. Satu adegan terdiri dari judul di kiri atas atau tengah atas, lalu 1-4 elemen sejajar dengan jarak sama. Elemen sejajar diberi ukuran sama. Fokus di tengah 80% bingkai.
- Gerak: elemen masuk dengan spring (fade + naik 40px + skala 0.94 ke 1) bergiliran selang 4-6 frame. Batang dan lingkaran tumbuh dari dasarnya, garis tergambar dari awal ke akhir (stroke-dashoffset), angka menghitung naik. Keluar lebih cepat (sekitar 10 frame). Setelah elemen masuk, diam 15-20 frame sebelum gerak berikutnya. Selalu clamp pada interpolate.
- Hindari: gradasi, bayangan, tokoh berwajah, lebih dari empat warna dalam satu adegan, teks panjang, dan ikon yang terlalu detail.
