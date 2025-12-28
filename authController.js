const db = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'super_secret_key_123'; // In production, use .env

exports.register = (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, 
        [username, hashedPassword], 
        function(err) {
            if (err) return res.status(400).json({ error: "User already exists or error occurred." });
            res.json({ message: "User created successfully." });
        }
    );
};

exports.login = (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) return res.status(401).json({ error: "Invalid credentials" });

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, username: user.username });
    });
};

// Middleware to protect routes
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};