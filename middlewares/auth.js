const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token is required' });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid Token' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Require Admin Role' });
    }
};

const isAnggota = (req, res, next) => {
    if (req.user && req.user.role === 'anggota') {
        next();
    } else {
        return res.status(403).json({ message: 'Require Anggota Role' });
    }
};

module.exports = {
    verifyToken,
    isAdmin,
    isAnggota
};
