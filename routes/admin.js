const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

// Apply middleware to all routes
router.use(verifyToken, isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Anggota
router.get('/anggota', adminController.getAllAnggota);
router.post('/anggota', adminController.createAnggota);
router.put('/anggota/:id', adminController.updateAnggota);
router.delete('/anggota/:id', adminController.deleteAnggota);

// Simpanan
router.get('/simpanan', adminController.getAllSimpanan);
router.post('/simpanan', adminController.createSimpanan);
router.put('/simpanan/:id', adminController.updateSimpanan);
router.put('/simpanan/:id/approve', adminController.approveSimpanan);
router.put('/simpanan/:id/reject', adminController.rejectSimpanan);
router.delete('/simpanan/:id', adminController.deleteSimpanan);

// Pinjaman
router.get('/pinjaman', adminController.getAllPinjaman);
router.post('/pinjaman', adminController.createPinjaman);
router.put('/pinjaman/:id', adminController.updatePinjaman);
router.delete('/pinjaman/:id', adminController.deletePinjaman);
router.put('/pinjaman/:id/status', adminController.updateStatusPinjaman);

// Angsuran
router.get('/angsuran', adminController.getAllAngsuran);
router.post('/angsuran', adminController.createAngsuran);
router.put('/angsuran/:id/approve', adminController.approveAngsuran);
router.put('/angsuran/:id/reject', adminController.rejectAngsuran);
router.delete('/angsuran/:id', adminController.deleteAngsuran);

// Notifikasi
router.get('/notifikasi', adminController.getSentNotifikasi);
router.post('/notifikasi', adminController.sendNotifikasi);
router.delete('/notifikasi/:id', adminController.deleteNotifikasi);

// SHU
router.get('/shu', adminController.getSentSHU);
router.post('/shu/distribute', adminController.distributeSHU);
router.delete('/shu/:id', adminController.deleteSHU);

module.exports = router;
