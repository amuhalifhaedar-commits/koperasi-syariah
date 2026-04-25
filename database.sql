-- ============================================================
-- DATABASE KOPERASI SIMPAN PINJAM
-- Script ini akan membuat database, tabel, dan data dummy
-- ============================================================

CREATE DATABASE IF NOT EXISTS koperasi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE koperasi_db;

-- ============================================================
-- HAPUS TABEL JIKA SUDAH ADA (urutan penting karena FK)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS angsuran;
DROP TABLE IF EXISTS pinjaman;
DROP TABLE IF EXISTS simpanan;
DROP TABLE IF EXISTS anggota;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- BUAT TABEL
-- ============================================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'anggota') DEFAULT 'anggota',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE anggota (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    alamat TEXT,
    no_hp VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE simpanan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anggota_id INT NOT NULL,
    jenis ENUM('pokok') NOT NULL DEFAULT 'pokok',
    jumlah DECIMAL(15, 2) NOT NULL,
    tanggal DATE NOT NULL,
    keterangan VARCHAR(255),
    FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE
);

CREATE TABLE pinjaman (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anggota_id INT NOT NULL,
    jumlah DECIMAL(15, 2) NOT NULL,
    bunga DECIMAL(5, 2) NOT NULL,
    tenor INT NOT NULL,
    status ENUM('pending', 'disetujui', 'ditolak', 'lunas') DEFAULT 'pending',
    tanggal_pengajuan DATE NOT NULL,
    tanggal_disetujui DATE,
    FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE
);

CREATE TABLE angsuran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pinjaman_id INT NOT NULL,
    jumlah_bayar DECIMAL(15, 2) NOT NULL,
    tanggal DATE NOT NULL,
    keterangan VARCHAR(255),
    FOREIGN KEY (pinjaman_id) REFERENCES pinjaman(id) ON DELETE CASCADE
);

CREATE TABLE notifikasi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anggota_id INT, -- NULL for all (broadcast)
    judul VARCHAR(100) NOT NULL,
    pesan TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE
);

CREATE TABLE shu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anggota_id INT NOT NULL,
    jumlah DECIMAL(15, 2) NOT NULL,
    tahun INT NOT NULL,
    tanggal DATE NOT NULL,
    keterangan VARCHAR(255),
    FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE
);

-- ============================================================
-- DATA USERS
-- Password semua akun: password123
-- Hash bcrypt untuk 'password123':
-- $2a$10$jSYO8x/Vl7JZCO1QMis6aOgck5BTBU00WMXoW5TaZC/2eehAOCkqG
-- ============================================================

INSERT INTO users (id, nama, email, password, role) VALUES
(1,  'Administrator',      'admin@koperasi.com',   '$2a$10$jSYO8x/Vl7JZCO1QMis6aOgck5BTBU00WMXoW5TaZC/2eehAOCkqG', 'admin'),
(2,  'Budi Santoso',       'budi@anggota.com',     '$2a$10$jSYO8x/Vl7JZCO1QMis6aOgck5BTBU00WMXoW5TaZC/2eehAOCkqG', 'anggota'),
(3,  'Siti Rahayu',        'siti@anggota.com',     '$2a$10$jSYO8x/Vl7JZCO1QMis6aOgck5BTBU00WMXoW5TaZC/2eehAOCkqG', 'anggota'),
(4,  'Ahmad Fauzi',        'ahmad@anggota.com',    '$2a$10$jSYO8x/Vl7JZCO1QMis6aOgck5BTBU00WMXoW5TaZC/2eehAOCkqG', 'anggota'),
(5,  'Dewi Lestari',       'dewi@anggota.com',     '$2a$10$jSYO8x/Vl7JZCO1QMis6aOgck5BTBU00WMXoW5TaZC/2eehAOCkqG', 'anggota'),
(6,  'Eko Prasetyo',       'eko@anggota.com',      '$2a$10$jSYO8x/Vl7JZCO1QMis6aOgck5BTBU00WMXoW5TaZC/2eehAOCkqG', 'anggota'),
(7,  'Fitria Handayani',   'fitria@anggota.com',   '$2a$10$jSYO8x/Vl7JZCO1QMis6aOgck5BTBU00WMXoW5TaZC/2eehAOCkqG', 'anggota'),
(8,  'Gunawan Wibowo',     'gunawan@anggota.com',  '$2a$10$jSYO8x/Vl7JZCO1QMis6aOgck5BTBU00WMXoW5TaZC/2eehAOCkqG', 'anggota'),
(9,  'Heni Kusumawati',    'heni@anggota.com',     '$2a$10$jSYO8x/Vl7JZCO1QMis6aOgck5BTBU00WMXoW5TaZC/2eehAOCkqG', 'anggota'),
(10, 'Irfan Maulana',      'irfan@anggota.com',    '$2a$10$jSYO8x/Vl7JZCO1QMis6aOgck5BTBU00WMXoW5TaZC/2eehAOCkqG', 'anggota'),
(11, 'Joko Widodo',        'joko@anggota.com',     '$2a$10$jSYO8x/Vl7JZCO1QMis6aOgck5BTBU00WMXoW5TaZC/2eehAOCkqG', 'anggota');

-- ============================================================
-- DATA ANGGOTA (detail profil)
-- ============================================================

INSERT INTO anggota (id, user_id, alamat, no_hp) VALUES
(1,  2,  'Jl. Merdeka No. 12, Jakarta Pusat',       '081234567801'),
(2,  3,  'Jl. Sudirman No. 45, Bandung',            '081234567802'),
(3,  4,  'Jl. Gatot Subroto No. 7, Surabaya',       '081234567803'),
(4,  5,  'Jl. Diponegoro No. 88, Yogyakarta',       '081234567804'),
(5,  6,  'Jl. Pahlawan No. 23, Semarang',           '081234567805'),
(6,  7,  'Jl. Ahmad Yani No. 56, Medan',            '081234567806'),
(7,  8,  'Jl. Imam Bonjol No. 34, Makassar',        '081234567807'),
(8,  9,  'Jl. Veteran No. 19, Malang',              '081234567808'),
(9,  10, 'Jl. Kartini No. 67, Denpasar',            '081234567809'),
(10, 11, 'Jl. Pemuda No. 101, Palembang',           '081234567810');

-- ============================================================
-- DATA SIMPANAN (Hanya Simpanan Pokok)
-- ============================================================

INSERT INTO simpanan (anggota_id, jenis, jumlah, tanggal, keterangan) VALUES
(1, 'pokok', 1300000, '2023-01-05', 'Total Simpanan Budi'),
(2, 'pokok', 2450000, '2023-01-10', 'Total Simpanan Siti'),
(3, 'pokok', 950000,  '2023-01-15', 'Total Simpanan Ahmad'),
(4, 'pokok', 2700000, '2023-02-01', 'Total Simpanan Dewi'),
(5, 'pokok', 1000000, '2023-02-05', 'Total Simpanan Eko'),
(6, 'pokok', 2200000, '2023-02-10', 'Total Simpanan Fitria'),
(7, 'pokok', 1400000, '2023-03-01', 'Total Simpanan Gunawan'),
(8, 'pokok', 1000000, '2023-03-05', 'Total Simpanan Heni'),
(9, 'pokok', 1200000, '2023-03-10', 'Total Simpanan Irfan'),
(10, 'pokok', 1800000, '2023-03-15', 'Total Simpanan Joko');

-- ============================================================
-- DATA PINJAMAN
-- ============================================================

INSERT INTO pinjaman (id, anggota_id, jumlah, bunga, tenor, status, tanggal_pengajuan, tanggal_disetujui) VALUES
(1,  1,  10000000, 2.0, 12, 'disetujui', '2023-02-01', '2023-02-05'),
(2,  2,  5000000,  2.0, 6,  'lunas',     '2023-01-15', '2023-01-20'),
(3,  3,  15000000, 2.0, 24, 'disetujui', '2023-03-01', '2023-03-07'),
(4,  4,  8000000,  2.0, 12, 'lunas',     '2023-02-10', '2023-02-15'),
(5,  5,  3000000,  2.0, 6,  'disetujui', '2023-03-15', '2023-03-20'),
(6,  6,  20000000, 2.0, 36, 'disetujui', '2023-04-01', '2023-04-05'),
(7,  7,  7500000,  2.0, 12, 'pending',   '2023-04-20', NULL),
(8,  8,  4000000,  2.0, 6,  'ditolak',   '2023-04-10', NULL),
(9,  9,  12000000, 2.0, 18, 'disetujui', '2023-03-20', '2023-03-25'),
(10, 10, 6000000,  2.0, 12, 'pending',   '2023-04-25', NULL);

-- ============================================================
-- DATA ANGSURAN
-- ============================================================

INSERT INTO angsuran (pinjaman_id, jumlah_bayar, tanggal, keterangan) VALUES
(1, 1033334, '2023-03-05', 'Angsuran 1'),
(1, 1033333, '2023-04-05', 'Angsuran 2'),
(1, 1033333, '2023-05-05', 'Angsuran 3'),
(2, 5600000, '2023-07-20', 'Pelunasan Siti'),
(4, 8960000, '2024-02-15', 'Pelunasan Dewi');

-- ============================================================
-- SELESAI
-- ============================================================
SELECT 'Database Terupdate (Simpanan Pokok & SHU Table)' AS Status;
