const express = require('express');
const router = express.Router();

// 📥 Import controller functions
const { 
    signup, 
    login, 
    logout 
} = require('../controllers/authController');

// 🛣️ Define Authentication Routes

// POST /api/auth/signup - Register a new user
router.post('/signup', signup);

// POST /api/auth/login - Log in a user (creates session)
router.post('/login', login);

// GET /api/auth/logout - Log out a user (destroys session)
router.get('/logout', logout);

module.exports = router;