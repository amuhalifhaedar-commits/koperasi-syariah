const express = require('express');
const router = express.Router();
const { verifyToken, isAnggota } = require('../middlewares/auth');
const anggotaController = require('../controllers/anggotaController');

// Apply middleware
router.use(verifyToken, isAnggota);

router.get('/dashboard', anggotaController.getDashboardStats);
router.get('/profil', anggotaController.getProfil);

// Simpanan
router.get('/simpanan', anggotaController.getSimpanan);
router.post('/simpanan', anggotaController.setorSimpanan);

// Pinjaman
router.get('/pinjaman', anggotaController.getPinjaman);
router.post('/pinjaman', anggotaController.ajukanPinjaman);

// Angsuran
router.get('/angsuran', anggotaController.getRiwayatAngsuran);

// Notifikasi
router.get('/notifikasi', anggotaController.getNotifikasi);
router.put('/notifikasi/:id/read', anggotaController.markNotifikasiRead);

// SHU
router.get('/shu', anggotaController.getSHU);

module.exports = router;
