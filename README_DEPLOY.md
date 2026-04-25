# Panduan Deployment Koperasi Syariah

Aplikasi ini dapat dihosting secara gratis tanpa merusak struktur kode Anda menggunakan **Render.com** (untuk server) dan **Aiven.io** (untuk database MySQL gratis).

## Langkah 1: Persiapan Database (Gratis di Aiven.io)
1.  Daftar di [Aiven.io](https://aiven.io/).
2.  Buat **MySQL Service** (pilih paket "Free Tier").
3.  Setelah aktif, salin **Service URI** (berbentuk `mysql://user:pass@host:port/defaultdb`).
4.  Gunakan alat seperti PHPMyAdmin atau MySQL Workbench untuk mengimpor file `database.sql` ke database baru tersebut.

## Langkah 2: Persiapan Kode
Saya telah memperbarui file berikut agar siap untuk hosting:
- `frontend/js/api.js`: URL API sekarang otomatis menyesuaikan (dinamis).
- `config/db.js`: Mendukung koneksi melalui variabel `DATABASE_URL`.

## Langkah 3: Hosting di Render.com (Gratis)
1.  Buat akun di [Render.com](https://render.com/).
2.  Hubungkan akun GitHub Anda dan pilih repositori `Koperasi Syariah` ini.
3.  Gunakan konfigurasi berikut:
    - **Language**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
4.  Buka tab **Environment** dan tambahkan variabel berikut:
    - `DATABASE_URL`: Isi dengan *Service URI* dari Aiven (Langkah 1).
    - `JWT_SECRET`: Isi dengan kata kunci rahasia Anda (bebas).
    - `PORT`: `5000` (atau biarkan default Render).

## Langkah 4: Selesai!
Render akan memberikan link publik (misal: `koperasi-syariah.onrender.com`). Anda sekarang dapat membagikan link tersebut kepada semua orang.

---
*Catatan: Pastikan Anda telah melakukan `git push` ke repositori online Anda sebelum menghubungkannya ke Render.*
