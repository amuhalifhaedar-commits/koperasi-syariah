const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Fetch anggota_id if role is anggota
        let anggota_id = null;
        if (user.role === 'anggota') {
            const [anggotaRows] = await pool.query('SELECT id FROM anggota WHERE user_id = ?', [user.id]);
            if (anggotaRows.length > 0) {
                anggota_id = anggotaRows[0].id;
            }
        }

        const payload = {
            id: user.id,
            role: user.role,
            anggota_id: anggota_id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
                anggota_id: anggota_id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.register = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { nama, email, password, alamat, no_hp } = req.body;

        if (!nama || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user exists
        const [existing] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into users
        const [userResult] = await connection.query(
            'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
            [nama, email, hashedPassword, 'anggota']
        );
        const userId = userResult.insertId;

        // Insert into anggota
        await connection.query(
            'INSERT INTO anggota (user_id, alamat, no_hp) VALUES (?, ?, ?)',
            [userId, alamat || '', no_hp || '']
        );

        await connection.commit();
        res.status(201).json({ message: 'Registration successful' });

    } catch (error) {
        await connection.rollback();
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
};
