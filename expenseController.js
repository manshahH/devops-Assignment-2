const db = require('./database');

// Get all transactions and calculate totals
exports.getDashboard = (req, res) => {
    const userId = req.user.id;

    db.all(`SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        let totalBudget = 0;
        let totalExpenses = 0;

        rows.forEach(row => {
            if (row.type === 'budget') totalBudget += row.amount;
            else if (row.type === 'expense') totalExpenses += row.amount;
        });

        const remaining = totalBudget - totalExpenses;

        res.json({
            transactions: rows,
            summary: {
                totalBudget,
                totalExpenses,
                remaining
            }
        });
    });
};

// Add Transaction (Budget or Expense)
exports.addTransaction = (req, res) => {
    const { type, description, amount } = req.body;
    const userId = req.user.id;
    const date = new Date().toLocaleDateString();

    db.run(`INSERT INTO transactions (user_id, type, description, amount, date) VALUES (?, ?, ?, ?, ?)`,
        [userId, type, description, parseFloat(amount), date],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Transaction added successfully" });
        }
    );
};