# Koperasi Simpan Pinjam Web App

Aplikasi Web Fullstack Koperasi Simpan Pinjam dengan Node.js, Express, MySQL, dan Tailwind CSS.

## Fitur Utama

- **Role Base Access:** Admin dan Anggota
- **Auth:** JWT Login dan Register User Hash Password
- **Admin:** Kelola Anggota, Terima/Tolak Pinjaman, Catat Simpanan, Catat Angsuran, Dashboard Rekap
- **Anggota:** Lihat riwayat Simpanan, Ajukan Pinjaman, Lihat Riwayat Angsuran, Profil

## Persyaratan Sistem

- Node.js (v14+ direkomendasikan)
- MySQL Server (XAMPP / Wampp / MySQL native)

## Cara Menjalankan Project

Ikuti langkah-langkah berikut agar aplikasi dapat berjalan dengan lancar tanpa error:

1. **Jalankan Database MySQL**
   - Pastikan service MySQL Anda aktif.
   - Buka phpMyAdmin (atau client MySQL lainnya).
   - *Penting:* Jangan buat database manual dulu.
   - Import/Jalankan seluruh query yang ada di file `database.sql` ke dalam MySQL Anda. File ini akan otomatis membuatkan database `koperasi_db` beserta tabelnya dan dummy datanya.

2. **Cek Konfigurasi Database**
   - Buka file `.env`.
   - Pastikan `DB_USER` dan `DB_PASSWORD` sesuai dengan konfigurasi lokal Anda (default XAMPP adalah user `root` dan password kosong / tidak ada password).

3. **Install Dependensi Backend**
   - Buka terminal / command prompt dan arahkan ke folder project (`d:\Koperasi Syariah`).
   - Jalankan perintah:
     ```bash
     npm install
     ```
   *(CATATAN: Anda harus memiliki Node.js terinstall untuk menjalankan perintah di atas).*

4. **Jalankan Server**
   - Di terminal yang sama, ketik perintah:
     ```bash
     npm start
     ```
   - *Atau jika ingin auto-restart saat ada perubahan kode (Mode Dev)*:
     ```bash
     npm run dev
     ```
   - Jika berhasil, akan muncul pesan `Server is running on port 5000`.

5. **Akses Aplikasi Melalui Browser**
   - Buka Web Browser (Chrome/Firefox/dll).
   - Akses: **`http://localhost:5000`**

---

## Akun Demo / Dummy Data

Setelah import `database.sql`, Anda dapat masuk menggunakan akun percobaan berikut:

**Akun Administrator:**
- **Email:** `admin@koperasi.com`
- **Password:** `password123`

**Akun Anggota Dummy:**
- **Email:** `budi@anggota.com`
- **Password:** `password123`

## Struktur Direktori Utama
- `/config` - Konfigurasi database MySQL
- `/controllers` - Logic bisnis backend
- `/routes` - Definisi rute REST API
- `/middlewares` - Auth Token verifier
- `/frontend` - Kode antarmuka (UI) HTML, JS, dan integrasi Tailwind CSS CDN
- `server.js` - Main entry file (Backend Express)
