const API_URL = '/api';
let token = localStorage.getItem('token');

// Initialize
if (token) {
    showDashboard();
}

// --- Auth Functions ---
async function register() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    document.getElementById('auth-msg').innerText = data.message || data.error;
}

async function login() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        token = data.token;
        showDashboard();
    } else {
        document.getElementById('auth-msg').innerText = data.error;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    location.reload();
}

// --- Dashboard Functions ---
function showDashboard() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('user-display').innerText = localStorage.getItem('username');
    fetchData();
}

async function fetchData() {
    const res = await fetch(`${API_URL}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if(res.status === 403 || res.status === 401) logout();

    document.getElementById('total-budget').innerText = data.summary.totalBudget;
    document.getElementById('total-expense').innerText = data.summary.totalExpenses;
    document.getElementById('remaining-balance').innerText = data.summary.remaining;

    const list = document.getElementById('transaction-list');
    list.innerHTML = '';
    data.transactions.forEach(t => {
        const li = document.createElement('li');
        const colorClass = t.type === 'budget' ? 'green' : 'red';
        const sign = t.type === 'budget' ? '+' : '-';
        li.innerHTML = `
            <span>${t.description || 'Budget Added'} <small>(${t.date})</small></span>
            <span class="${colorClass}">${sign}$${t.amount}</span>
        `;
        list.appendChild(li);
    });
}

async function addTransaction(type) {
    let amount, desc;
    
    if (type === 'budget') {
        amount = document.getElementById('budget-amount').value;
        desc = "Budget Add";
    } else {
        amount = document.getElementById('expense-amount').value;
        desc = document.getElementById('expense-desc').value;
    }

    if (!amount) return alert("Please enter an amount");

    await fetch(`${API_URL}/transaction`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, description: desc, amount })
    });

    // Clear inputs and refresh
    document.getElementById('budget-amount').value = '';
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-desc').value = '';
    fetchData();
}