---
deskripsi: Stickman dan objek sederhana dengan garis spidol hitam tebal dan warna rata yang cerah.
---
Gaya ini didefinisikan oleh aturan di bawah. Contoh kodenya ada di `contoh/`; pakai komponen di `contoh/components/Marker.tsx` (`Stickman`, `wobbly`, `wobblyRect`, `circlePath`, `Exclaim`, palet `M`, tebal garis `LINE`) agar setiap adegan konsisten.

## Garis
- Semua bentuk punya garis tepi spidol hitam (`M.ink`), tanpa kecuali: karakter, objek, latar, tanda penegas.
- Garis tepi utama tebal dan seragam (`LINE`, sekitar 12 px pada 1920x1080), dengan ujung dan sambungan bulat.
- Detail di dalam objek, misalnya panel pintu, jendela, atau lipatan kertas, juga digaris spidol, lebih tipis (sekitar setengah `LINE`).
- Garis sedikit tidak rata seperti digambar tangan, memakai `wobbly`/`circlePath` dengan seed tetap. Garis tidak boleh bergetar atau berubah bentuk dari frame ke frame.

## Warna
- Setiap bidang diisi satu warna rata dari palet `M`.
- Tanpa arsiran, gradasi, tekstur, bayangan, kilau, atau transparansi.
- Latar terang dan tenang (langit biru muda, rumput hijau muda), sehingga karakter dan objek utama menonjol.

## Karakter (stickman)
- Kepala berupa lingkaran putih besar bergaris spidol tebal.
- Badan, lengan, dan kaki masing-masing satu garis spidol. Tangan cukup berupa ujung garis; lingkaran kecil hanya dipakai bila tangan menyentuh sesuatu, misalnya dagu.
- Wajah minimal: tanpa wajah, atau dua mata oval hitam. Mulut hanya ditambahkan bila ekspresi membutuhkannya (misalnya terkejut). Tanpa hidung, pipi, alis, atau rambut.
- Emosi disampaikan lewat pose dan tanda penegas, bukan detail wajah: tangan di dagu berarti berpikir, bahu terangkat berarti bingung, menunjuk berarti menemukan.

## Bentuk dan objek
- Objek disederhanakan menjadi bentuk dasar (persegi, lingkaran, segitiga, lengkung) dengan detail secukupnya agar objeknya terbaca.
- Satu objek, satu fungsi: setiap objek di layar membantu menjelaskan narasi.

## Penegas dan teks
- Tanda seru, tanda tanya, dan goresan penegas berwarna kuning/oranye dengan garis tepi spidol, muncul memantul di dekat kepala atau objek yang dibahas.
- Awan pikiran berwarna putih bergaris spidol, berisi objek sederhana (bukan kalimat).
- Teks hanya untuk angka, istilah, atau label penting: huruf tebal berwarna tinta, ditulis di atas kertas, papan, atau label putih bergaris spidol.

## Komposisi dan gerak
- Satu fokus per adegan. Stickman dekat ke kamera dengan kepala besar di sepertiga kiri atau kanan, dan badan boleh terpotong tepi frame. Objek yang dibahas ada di sisi lainnya.
- Gerak sederhana dan jelas: objek membuka atau bergeser dengan pegas, tanda penegas muncul memantul, karakter bernapas pelan. Hindari gerak dekoratif yang tidak menjelaskan apa pun.

## Hindari
- Arsiran, gradasi, bayangan, efek kertas, atau tekstur.
- Bentuk tanpa garis tepi spidol, atau garis tepi dengan warna selain tinta hitam.
- Wajah detail, rambut, atau pakaian pada stickman.
- Adegan yang terlalu ramai, dengan banyak objek yang bersaing.
