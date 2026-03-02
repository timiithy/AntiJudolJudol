---
layout: default
title: Home
---

Nama Kelompok: **MAXWIN77**

Anggota:

- Timothy Tanuwidjaya (23/515955/TK/56763)
- Atalie Savista Arunata (23/522436/TK/57668)
- Zaki Fadhila Rahman (23/520148/TK/57327)

# Project Senior Project TI

## Departemen Teknik Elektro dan Teknologi Informasi, Fakultas Teknik Universitas Gadjah Mada

### Metodologi SDLC

Metolodi yang digunakan: **Agile (Scrum)**

Alasan pemilihan metodologi:

Situs judi online berubah sangat cepat (konsep mirroringnya). Metode Agile dapat memungkinkan bagi tim untuk melakukan iterasi cepat di algoritma Naive Bayes dan crawler secara berkelanjutan tanpa harus menunggu seluruh sistem selesai (mudah untuk akomodasi perubahan pada requirement dan fungsionalitas produk dapat diuji bertahap) sehingga MVP bisa segera diuji.

### Tujuan dari produk

Membangun sistem yang secara proaktif mampu mendeteksi, mengklasifikasi, dan mendata URL judi online secara otomatis menggunakan AI untuk memutus rantai penyebaran situs judi di Indonesia.

### Pengguna potensial dari produk

Pemerintah/ Komdigi ⇒ laporan daftar URL yang valid untuk diblokir pemerintah.
Masyarakat ⇒ alat verifikasi cepat untuk memastikan keamanan situs/ link.
Analisis Keamanan ⇒ visualisasi tren persebaran judi online dari dashboard statistik.

### Use case diagram

![Use Case Diagram] (images/ucd.png)

### Functional Requirement

| Function | Deskripsi |
|------|---------|
| FR-01 | Sistem menyediakan kolom input di landing page agar user dapat memasukkan URL untuk dipindai secara real-time.|
| FR-02 | Sistem menampilkan label “Aman” atau “Tidak Aman” beserta skor probabilitas hasil klasifikasi Naive Bayes setelah pemindaian selesai. |
| FR-03 | Sistem menjalankan skrip crawler di background untuk mencari URL baru dari situs internet. |
| FR-04 | Sistem memperbarui grafik tren si dashboard statistik secara otomatis tiap kali ditemukan inputan data baru di database. |
| FR-05 | Sistem menyediakan button “Export CSV” yang dapat diklik oleh user untuk mengunduh daftar URL yang telah diverifikasi sebagai situs judi. |

### Entity Relationship Diagram

![Entity Relationship Diagram] (images/erd.png)

### Low-fidelity Wireframe

![Lo-Fi Wireframe] (images/wireframe.png)

### Gantt-Chart Pengerjaan Proyek dalam Kurun Waktu 1 Semester

![Timeline Pengerjaan Proyek] (images/gantt_chart.png)





