const express = require('express');
const router = express.Router();

// 📥 Import controller functions
const { 
    getAllCars, 
    searchCars, 
    getCarById 
} = require('../controllers/carController');

// 🛣️ Define Car Routes

// GET /api/cars/all - Retrieve all listed cars
router.get('/all', getAllCars);

// POST /api/cars/search - Search for available cars based on date/time criteria
router.post('/search', searchCars);

// GET /api/cars/:id - Retrieve details for a single car by ID
router.get('/:id', getCarById);

module.exports = router;