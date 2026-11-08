---
deskripsi: Potongan kertas berwarna rata yang ditumpuk dengan bayangan kecil, bentuk serba melengkung, karakter sederhana yang tenang.
---
Gaya ini didefinisikan oleh aturan di bawah. Contoh kodenya ada di `contoh/`: adegan kafe di `contoh/components/CafeScene.tsx`. Pakai `<Cut>` dan `Capsule` dari `contoh/components/Cut.tsx`, serta palet `P` dan `scallopTop` dari `contoh/components/Paper.tsx`, agar setiap adegan konsisten.

## Prinsip: bentuk sederhana yang ditumpuk
- Semua objek dibangun dari bentuk dasar: lingkaran, elips, kapsul, persegi bersudut bulat, dan gumpalan membulat.
- Setiap bentuk adalah satu potongan kertas berwarna rata, dibungkus `<Cut>` sehingga menjatuhkan bayangan kecil ke potongan di bawahnya. Bayangan antarlapisan inilah satu-satunya sumber kedalaman.
- Urutan tumpukan mengikuti logika benda: yang di belakang digambar lebih dulu.

## Warna dan permukaan
- Satu warna rata per potongan, dari palet `P`.
- Tanpa garis tepi, gradasi, tekstur, kilau, transparansi, vignette, atau efek tambahan lain.
- Langit satu warna dengan satu atau dua pita bergelombang (`scallopTop`) di tepi atas.

## Bentuk
- Semua bentuk melengkung atau bersudut bulat; tidak ada sudut tajam. Mahkota, kilau, panah, dan segitiga pun ujungnya tumpul.
- Detail secukupnya agar objek terbaca. Jika sebuah bentuk tidak membantu objek terbaca, hilangkan.

## Karakter
- Kepala lingkaran, badan satu bentuk membulat, lengan kapsul, tangan lingkaran kecil.
- Wajah hanya alis, mata oval kecil, dan mulut kecil yang terletak di tengah di bawah kedua mata, di dalam lingkaran wajah. Tanpa pipi merah dan tanpa hidung.
- Rambut mengikuti logika tumbuhnya: menempel di kulit kepala mengikuti lengkungnya, dengan garis rambut di atas alis yang melengkung ke belakang lewat atas telinga sampai tengkuk. Volume dan poni keluar dari ubun-ubun. Rambut panjang jatuh dari belakang kepala.
- Ekspresi tenang dan ditahan (senyum kecil, mata tertutup senang, tangan di dagu), bukan ekspresi berlebihan.
- Tampak samping tiga perempat. Dua tokoh yang berinteraksi saling berhadapan.

## Komposisi
- Satu fokus per adegan, dengan jarak antarobjek yang lega.
- Karakter dekat ke kamera dan mengisi bagian bawah frame. Latar (bangunan, jendela, semak) berada di belakang mereka.
- Elemen pendukung, seperti gelembung pikiran, kilau, dan ikon, ditempatkan di ruang kosong tanpa menutupi wajah.

## Gerak
- Potongan kertas muncul dengan sedikit memantul (`pop`). Gerak diam karakter (napas, kedip) berjalan per dua frame (`onTwos`), seperti animasi potongan kertas.
- Gerak kecil dan tenang. Hindari gerak dekoratif yang tidak menjelaskan apa pun.

## Hindari
- Garis tepi atau garis stiker putih di sekeliling objek.
- Gradasi, tekstur kertas, kilau, transparansi, atau vignette.
- Sudut tajam.
- Pipi merah, mulut di tepi wajah, atau rambut yang menutupi mata.
- Proporsi dan ekspresi kekanak-kanakan yang berlebihan.
- Adegan yang terlalu ramai.
