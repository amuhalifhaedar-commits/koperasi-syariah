const pool = require('../config/db');

// --- Dashboard ---
exports.getDashboardStats = async (req, res) => {
    try {
        const [anggotaRes] = await pool.query("SELECT COUNT(*) as total_anggota FROM anggota");
        const [simpananRes] = await pool.query("SELECT COALESCE(SUM(jumlah), 0) as total_simpanan FROM simpanan");
        const [pinjamanRes] = await pool.query("SELECT COALESCE(SUM(jumlah), 0) as total_pinjaman FROM pinjaman WHERE status='disetujui'");
        
        res.json({
            total_anggota: anggotaRes[0].total_anggota,
            total_simpanan: simpananRes[0].total_simpanan,
            total_pinjaman: pinjamanRes[0].total_pinjaman
        });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Anggota ---
exports.getAllAnggota = async (req, res) => {
    try {
        const query = `
            SELECT a.id as anggota_id, u.id as user_id, u.nama, u.email, a.alamat, a.no_hp
            FROM anggota a
            JOIN users u ON a.user_id = u.id
            ORDER BY u.nama ASC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createAnggota = async (req, res) => {
    const { nama, email, password, alamat, no_hp } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password || 'password123', 10);
        
        const [userRes] = await connection.query(
            "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, 'anggota')",
            [nama, email, hashedPassword]
        );
        
        await connection.query(
            "INSERT INTO anggota (user_id, alamat, no_hp) VALUES (?, ?, ?)",
            [userRes.insertId, alamat, no_hp]
        );
        
        await connection.commit();
        res.status(201).json({ message: 'Anggota created successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    } finally {
        connection.release();
    }
};

exports.updateAnggota = async (req, res) => {
    const { id } = req.params; // anggota_id
    const { nama, email, alamat, no_hp } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [anggota] = await connection.query("SELECT user_id FROM anggota WHERE id = ?", [id]);
        if (anggota.length === 0) throw new Error('Anggota not found');
        
        const userId = anggota[0].user_id;
        await connection.query("UPDATE users SET nama = ?, email = ? WHERE id = ?", [nama, email, userId]);
        await connection.query("UPDATE anggota SET alamat = ?, no_hp = ? WHERE id = ?", [alamat, no_hp, id]);
        
        await connection.commit();
        res.json({ message: 'Anggota updated successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
};

exports.deleteAnggota = async (req, res) => {
    const { id } = req.params;
    try {
        const [anggota] = await pool.query('SELECT user_id FROM anggota WHERE id = ?', [id]);
        if (anggota.length === 0) return res.status(404).json({ message: 'Anggota not found' });
        
        const userId = anggota[0].user_id;
        await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: 'Anggota deleted successfully' });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Simpanan ---
exports.getAllSimpanan = async (req, res) => {
    try {
        const query = `
            SELECT s.*, u.nama 
            FROM simpanan s
            JOIN anggota a ON s.anggota_id = a.id
            JOIN users u ON a.user_id = u.id
            ORDER BY s.tanggal DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createSimpanan = async (req, res) => {
    const { anggota_id, jumlah, tanggal, keterangan } = req.body;
    try {
        await pool.query(
            'INSERT INTO simpanan (anggota_id, jenis, jumlah, tanggal, keterangan) VALUES (?, "pokok", ?, ?, ?)',
            [anggota_id, jumlah, tanggal, keterangan]
        );
        res.status(201).json({ message: 'Simpanan added successfully' });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateSimpanan = async (req, res) => {
    const { id } = req.params;
    const { jumlah, tanggal, keterangan, status } = req.body;
    try {
        await pool.query(
            "UPDATE simpanan SET jumlah = ?, tanggal = ?, keterangan = ?, status = ? WHERE id = ?",
            [jumlah, tanggal, keterangan, status || 'berhasil', id]
        );
        res.json({ message: 'Simpanan updated' });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.approveSimpanan = async (req, res) => {
    const { id } = req.params;
    try {
        const [simpanan] = await pool.query("SELECT * FROM simpanan WHERE id = ?", [id]);
        if (simpanan.length === 0) return res.status(404).json({ message: 'Simpanan not found' });
        
        const data = simpanan[0];
        await pool.query("UPDATE simpanan SET status = 'berhasil' WHERE id = ?", [id]);
        
        // Kirim notifikasi
        await pool.query(
            "INSERT INTO notifikasi (anggota_id, judul, pesan) VALUES (?, ?, ?)",
            [data.anggota_id, "Setoran Berhasil", `Setoran Anda sebesar Rp ${Number(data.jumlah).toLocaleString()} telah disetujui.`]
        );

        res.json({ message: 'Simpanan berhasil disetujui' });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.rejectSimpanan = async (req, res) => {
    const { id } = req.params;
    try {
        const [simpanan] = await pool.query("SELECT * FROM simpanan WHERE id = ?", [id]);
        if (simpanan.length === 0) return res.status(404).json({ message: 'Simpanan not found' });
        
        const data = simpanan[0];
        await pool.query("UPDATE simpanan SET status = 'ditolak' WHERE id = ?", [id]);
        
        // Kirim notifikasi
        await pool.query(
            "INSERT INTO notifikasi (anggota_id, judul, pesan) VALUES (?, ?, ?)",
            [data.anggota_id, "Setoran Ditolak", `Setoran Anda sebesar Rp ${Number(data.jumlah).toLocaleString()} ditolak. Silakan hubungi admin.`]
        );

        res.json({ message: 'Simpanan ditolak' });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteSimpanan = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM simpanan WHERE id = ?", [id]);
        res.json({ message: 'Simpanan deleted' });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Pinjaman ---
exports.getAllPinjaman = async (req, res) => {
    try {
        const query = `
            SELECT p.*, u.nama 
            FROM pinjaman p
            JOIN anggota a ON p.anggota_id = a.id
            JOIN users u ON a.user_id = u.id
            ORDER BY p.tanggal_pengajuan DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createPinjaman = async (req, res) => {
    const { anggota_id, jumlah, bunga: bungaInput, tenor, tanggal_pengajuan } = req.body;
    try {
        // Hitung bunga otomatis berdasarkan tier kelipatan pinjaman
        let bunga = parseFloat(bungaInput);
        if (!bunga || bunga <= 0) {
            const jml = parseFloat(jumlah);
            if (jml <= 1000000)       bunga = 1.0;
            else if (jml <= 5000000)  bunga = 1.5;
            else if (jml <= 10000000) bunga = 2.0;
            else if (jml <= 20000000) bunga = 2.5;
            else                      bunga = 3.0;
        }
        await pool.query(
            "INSERT INTO pinjaman (anggota_id, jumlah, bunga, tenor, tanggal_pengajuan, status) VALUES (?, ?, ?, ?, ?, 'pending')",
            [anggota_id, jumlah, bunga, tenor, tanggal_pengajuan]
        );
        res.status(201).json({ message: 'Pinjaman created successfully' });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePinjaman = async (req, res) => {
    const { id } = req.params;
    const { jumlah, bunga, tenor, status } = req.body;
    try {
        await pool.query(
            "UPDATE pinjaman SET jumlah = ?, bunga = ?, tenor = ?, status = ? WHERE id = ?",
            [jumlah, bunga, tenor, status, id]
        );
        res.json({ message: 'Pinjaman updated' });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deletePinjaman = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM pinjaman WHERE id = ?", [id]);
        res.json({ message: 'Pinjaman deleted' });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateStatusPinjaman = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const [pinjaman] = await pool.query(`
            SELECT p.*, ag.id as anggota_id 
            FROM pinjaman p 
            JOIN anggota ag ON p.anggota_id = ag.id 
            WHERE p.id = ?
        `, [id]);

        if (pinjaman.length === 0) return res.status(404).json({ message: 'Pinjaman not found' });
        
        const data = pinjaman[0];
        let updateQuery = 'UPDATE pinjaman SET status = ? WHERE id = ?';
        let params = [status, id];
        if (status === 'disetujui') {
            updateQuery = 'UPDATE pinjaman SET status = ?, tanggal_disetujui = CURDATE() WHERE id = ?';
        }
        await pool.query(updateQuery, params);

        // Kirim notifikasi
        const judul = status === 'disetujui' ? "Pinjaman Disetujui" : "Pinjaman Ditolak";
        const pesan = status === 'disetujui' ? 
            `Pengajuan pinjaman Anda sebesar Rp ${Number(data.jumlah).toLocaleString()} telah disetujui.` : 
            `Pengajuan pinjaman Anda sebesar Rp ${Number(data.jumlah).toLocaleString()} ditolak.`;
        
        await pool.query(
            "INSERT INTO notifikasi (anggota_id, judul, pesan) VALUES (?, ?, ?)",
            [data.anggota_id, judul, pesan]
        );

        res.json({ message: `Pinjaman status updated to ${status}` });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Angsuran ---
exports.getAllAngsuran = async (req, res) => {
    try {
        const query = `
            SELECT ang.*, u.nama, p.jumlah as pinjaman_total, p.tenor, p.bunga,
                (SELECT COUNT(*) FROM angsuran a2 WHERE a2.pinjaman_id = ang.pinjaman_id AND a2.id <= ang.id) as angsuran_ke
            FROM angsuran ang
            JOIN pinjaman p ON ang.pinjaman_id = p.id
            JOIN anggota a ON p.anggota_id = a.id
            JOIN users u ON a.user_id = u.id
            ORDER BY ang.tanggal DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createAngsuran = async (req, res) => {
    const { pinjaman_id, jumlah_bayar, tanggal, keterangan } = req.body;
    try {
        await pool.query(
            'INSERT INTO angsuran (pinjaman_id, jumlah_bayar, tanggal, keterangan) VALUES (?, ?, ?, ?)',
            [pinjaman_id, jumlah_bayar, tanggal, keterangan]
        );
        const [totalBayarRes] = await pool.query('SELECT SUM(jumlah_bayar) as total FROM angsuran WHERE pinjaman_id = ?', [pinjaman_id]);
        const [pinjamanRes] = await pool.query('SELECT jumlah, bunga, tenor FROM pinjaman WHERE id = ?', [pinjaman_id]);
        if (pinjamanRes.length > 0 && totalBayarRes.length > 0) {
            const p = pinjamanRes[0];
            const totalHutang = parseFloat(p.jumlah) + (parseFloat(p.jumlah) * (parseFloat(p.bunga) / 100) * parseInt(p.tenor));
            if (parseFloat(totalBayarRes[0].total) >= totalHutang) {
                await pool.query("UPDATE pinjaman SET status = 'lunas' WHERE id = ?", [pinjaman_id]);
            }
        }
        res.status(201).json({ message: 'Angsuran recorded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error recording installment: ' + error.message });
    }
};

exports.updateAngsuran = async (req, res) => {
    const { id } = req.params;
    const { jumlah_bayar, tanggal, keterangan } = req.body;
    try {
        await pool.query(
            "UPDATE angsuran SET jumlah_bayar = ?, tanggal = ?, keterangan = ? WHERE id = ?",
            [jumlah_bayar, tanggal, keterangan, id]
        );
        res.json({ message: 'Angsuran updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating installment: ' + error.message });
    }
};

exports.deleteAngsuran = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM angsuran WHERE id = ?", [id]);
        res.json({ message: 'Angsuran deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting installment: ' + error.message });
    }
};

// --- Notifikasi ---
exports.getSentNotifikasi = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT n.*, u.nama as nama_anggota 
            FROM notifikasi n 
            LEFT JOIN anggota a ON n.anggota_id = a.id 
            LEFT JOIN users u ON a.user_id = u.id 
            ORDER BY n.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.sendNotifikasi = async (req, res) => {
    const { anggota_id, judul, pesan } = req.body; // anggota_id NULL for broadcast
    try {
        await pool.query(
            "INSERT INTO notifikasi (anggota_id, judul, pesan) VALUES (?, ?, ?)",
            [anggota_id || null, judul, pesan]
        );
        res.status(201).json({ message: 'Notifikasi sent successfully' });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteNotifikasi = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM notifikasi WHERE id = ?", [id]);
        res.json({ message: 'Notifikasi deleted' });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- SHU ---
exports.getSentSHU = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, u.nama as nama_anggota 
            FROM shu s
            JOIN anggota a ON s.anggota_id = a.id 
            JOIN users u ON a.user_id = u.id 
            ORDER BY s.tahun DESC, s.tanggal DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.distributeSHU = async (req, res) => {
    const { total_shu, tahun } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get total savings of all members
        const [totalSavingsRes] = await connection.query("SELECT SUM(jumlah) as total FROM simpanan");
        const totalGlobalSavings = parseFloat(totalSavingsRes[0].total) || 0;

        if (totalGlobalSavings === 0) {
            throw new Error("Total simpanan koperasi adalah 0. Tidak ada pembagian SHU.");
        }

        // 2. Get total savings per individual member
        const [memberSavings] = await connection.query(`
            SELECT anggota_id, SUM(jumlah) as total_member 
            FROM simpanan 
            GROUP BY anggota_id
        `);

        // 3. Distribute SHU
        const tanggal = new Date().toISOString().split('T')[0];
        for (const member of memberSavings) {
            const ratio = parseFloat(member.total_member) / totalGlobalSavings;
            const portion = ratio * parseFloat(total_shu);
            const keterangan = `SHU Tahun ${tahun} - Berdasarkan simpanan`;

            await connection.query(
                "INSERT INTO shu (anggota_id, jumlah, tahun, tanggal, keterangan) VALUES (?, ?, ?, ?, ?)",
                [member.anggota_id, portion, tahun, tanggal, keterangan]
            );
        }

        await connection.commit();
        res.status(201).json({ message: `SHU Tahun ${tahun} berhasil dibagikan.` });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message || 'Server error' });
    } finally {
        connection.release();
    }
};

exports.deleteSHU = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM shu WHERE id = ?", [id]);
        res.json({ message: 'SHU record deleted' });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.approveAngsuran = async (req, res) => {
    const { id } = req.params;
    try {
        const [angsuran] = await pool.query(`
            SELECT a.*, ag.id as anggota_id 
            FROM angsuran a
            JOIN pinjaman p ON a.pinjaman_id = p.id
            JOIN anggota ag ON p.anggota_id = ag.id
            WHERE a.id = ?
        `, [id]);

        if (angsuran.length === 0) return res.status(404).json({ message: 'Angsuran not found' });
        
        await pool.query("UPDATE angsuran SET status = 'berhasil' WHERE id = ?", [id]);
        
        await pool.query(
            "INSERT INTO notifikasi (anggota_id, judul, pesan) VALUES (?, ?, ?)",
            [angsuran[0].anggota_id, "Pembayaran Angsuran Berhasil", `Pembayaran angsuran sebesar Rp ${Number(angsuran[0].jumlah_bayar).toLocaleString()} telah disetujui.`]
        );

        res.json({ message: 'Angsuran disetujui' });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.rejectAngsuran = async (req, res) => {
    const { id } = req.params;
    try {
        const [angsuran] = await pool.query(`
            SELECT a.*, ag.id as anggota_id 
            FROM angsuran a
            JOIN pinjaman p ON a.pinjaman_id = p.id
            JOIN anggota ag ON p.anggota_id = ag.id
            WHERE a.id = ?
        `, [id]);

        if (angsuran.length === 0) return res.status(404).json({ message: 'Angsuran not found' });
        
        await pool.query("UPDATE angsuran SET status = 'ditolak' WHERE id = ?", [id]);
        
        await pool.query(
            "INSERT INTO notifikasi (anggota_id, judul, pesan) VALUES (?, ?, ?)",
            [angsuran[0].anggota_id, "Pembayaran Angsuran Ditolak", `Pembayaran angsuran sebesar Rp ${Number(angsuran[0].jumlah_bayar).toLocaleString()} ditolak.`]
        );

        res.json({ message: 'Angsuran ditolak' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
