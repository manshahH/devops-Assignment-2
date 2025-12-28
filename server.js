const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authController = require('./authController');
const expenseController = require('./expenseController');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Auth Routes
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// Protected Routes
app.get('/api/dashboard', authController.authenticateToken, expenseController.getDashboard);
app.post('/api/transaction', authController.authenticateToken, expenseController.addTransaction);


app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

























































































