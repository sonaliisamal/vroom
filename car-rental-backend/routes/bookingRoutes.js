const express = require('express');
const router = express.Router();

// 🛡️ Import Middleware
// This middleware will check for a valid session/token before proceeding
const { protect } = require('../middleware/authMiddleware'); 

// 📥 Import controller functions
const { 
    createBooking, 
    cancelBooking, 
    processPayment, 
    getMyBookings 
} = require('../controllers/bookingController');

// All routes below require user authentication (protection)
router.use(protect); // Apply the protect middleware to all subsequent routes

// 🛣️ Define Booking Routes

// POST /api/bookings/create - Create a new booking
router.post('/create', createBooking);

// POST /api/bookings/cancel - Cancel an existing booking
// Often takes the booking ID in the body or URL
router.post('/cancel', cancelBooking);

// POST /api/bookings/pay - Process payment for a pending booking
router.post('/pay', processPayment);

// GET /api/bookings/my-bookings - Retrieve all bookings made by the current user
router.get('/my-bookings', getMyBookings);

module.exports = router;