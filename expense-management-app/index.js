const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock user data
const users = [
    {
        username: 'user1',
        password: '$2a$10$somethinghashedhere', // hashed password
    }
];

// User login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(400).send({ error: 'Invalid username or password' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).send({ error: 'Invalid username or password' });
    }

    // Generate JWT
    const token = jwt.sign({ username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
    res.send({ token });
});

let expenses = []; // In-memory expense data (for demonstration purposes)

// Get all expenses
app.get('/api/expenses', (req, res) => {
    res.send(expenses);
});

// Add a new expense
app.post('/api/expenses', (req, res) => {
    const expense = { id: Date.now(), ...req.body };
    expenses.push(expense);
    res.status(201).send(expense);
});

// Update an existing expense
app.put('/api/expenses/:id', (req, res) => {
    const expenseId = parseInt(req.params.id);
    const expenseIndex = expenses.findIndex(e => e.id === expenseId);

    if (expenseIndex === -1) {
        return res.status(404).send({ error: 'Expense not found' });
    }

    expenses[expenseIndex] = { ...expenses[expenseIndex], ...req.body };
    res.send(expenses[expenseIndex]);
});

// Delete an existing expense
app.delete('/api/expenses/:id', (req, res) => {
    const expenseId = parseInt(req.params.id);
    expenses = expenses.filter(e => e.id !== expenseId);

    res.status(204).send();
});

app.get('/api/expense', (req, res) => {
    const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);
    res.send({ total: totalExpense });
});


const { check, validationResult } = require('express-validator');

app.post('/api/auth/login', [
    check('username').isString().notEmpty(),
    check('password').isString().notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    // Continue with authentication...
});

