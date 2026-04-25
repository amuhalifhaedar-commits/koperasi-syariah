const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const anggota_id = req.user.anggota_id;

        const [simpananRes] = await pool.query("SELECT COALESCE(SUM(jumlah), 0) as total_simpanan FROM simpanan WHERE anggota_id = ?", [anggota_id]);
        const [pinjamanRes] = await pool.query("SELECT COALESCE(SUM(jumlah), 0) as sisa_pinjaman FROM pinjaman WHERE anggota_id = ? AND status='disetujui'", [anggota_id]);
        const [angsuranRes] = await pool.query(`
            SELECT COALESCE(SUM(a.jumlah_bayar), 0) as total_angsuran FROM angsuran a
            JOIN pinjaman p ON a.pinjaman_id = p.id
            WHERE p.anggota_id = ?
        `, [anggota_id]);
        const [shuRes] = await pool.query("SELECT COALESCE(SUM(jumlah), 0) as total_shu FROM shu WHERE anggota_id = ?", [anggota_id]);

        res.json({
            total_simpanan: simpananRes[0].total_simpanan,
            total_pinjaman: pinjamanRes[0].sisa_pinjaman,
            total_angsuran_dibayar: angsuranRes[0].total_angsuran,
            total_shu: shuRes[0].total_shu
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProfil = async (req, res) => {
    try {
        const query = `
            SELECT a.*, u.nama, u.email 
            FROM anggota a 
            JOIN users u ON a.user_id = u.id 
            WHERE a.id = ?
        `;
        const [rows] = await pool.query(query, [req.user.anggota_id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Profil not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getSimpanan = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM simpanan WHERE anggota_id = ? ORDER BY tanggal DESC", [req.user.anggota_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.setorSimpanan = async (req, res) => {
    const { jumlah, keterangan } = req.body;
    try {
        if (!jumlah || parseFloat(jumlah) <= 0) {
            return res.status(400).json({ message: 'Jumlah setoran tidak valid' });
        }
        const tanggal = new Date().toISOString().split('T')[0];
        await pool.query(
            "INSERT INTO simpanan (anggota_id, jenis, jumlah, tanggal, keterangan) VALUES (?, 'pokok', ?, ?, ?)",
            [req.user.anggota_id, jumlah, tanggal, keterangan || 'Setoran Mandiri']
        );
        res.status(201).json({ message: 'Konfirmasi setoran berhasil dikirim. Menunggu verifikasi admin.' });
    } catch (error) {
        console.error('setorSimpanan error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getSHU = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM shu WHERE anggota_id = ? ORDER BY tahun DESC, tanggal DESC", [req.user.anggota_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.ajukanPinjaman = async (req, res) => {
    const { jumlah, tenor } = req.body;
    try {
        // Hitung bunga otomatis berdasarkan kelipatan jumlah pinjaman
        const jml = parseFloat(jumlah);
        let bunga;
        if (jml <= 1000000)       bunga = 1.0;  // ≤ 1 juta
        else if (jml <= 5000000)  bunga = 1.5;  // ≤ 5 juta
        else if (jml <= 10000000) bunga = 2.0;  // ≤ 10 juta
        else if (jml <= 20000000) bunga = 2.5;  // ≤ 20 juta
        else                      bunga = 3.0;  // > 20 juta

        const tanggal_pengajuan = new Date().toISOString().split('T')[0];
        await pool.query(
            "INSERT INTO pinjaman (anggota_id, jumlah, bunga, tenor, status, tanggal_pengajuan) VALUES (?, ?, ?, ?, 'pending', ?)",
            [req.user.anggota_id, jumlah, bunga, tenor, tanggal_pengajuan]
        );
        res.status(201).json({ message: 'Pinjaman berhasil diajukan', bunga });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPinjaman = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM pinjaman WHERE anggota_id = ? ORDER BY tanggal_pengajuan DESC", [req.user.anggota_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRiwayatAngsuran = async (req, res) => {
    try {
        const query = `
            SELECT a.* 
            FROM angsuran a
            JOIN pinjaman p ON a.pinjaman_id = p.id
            WHERE p.anggota_id = ?
            ORDER BY a.tanggal DESC
        `;
        const [rows] = await pool.query(query, [req.user.anggota_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Notifikasi ---
exports.getNotifikasi = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM notifikasi WHERE anggota_id = ? OR anggota_id IS NULL ORDER BY created_at DESC",
            [req.user.anggota_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markNotifikasiRead = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(
            "UPDATE notifikasi SET is_read = TRUE WHERE id = ? AND (anggota_id = ? OR anggota_id IS NULL)",
            [id, req.user.anggota_id]
        );
        res.json({ message: 'Notifikasi marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
