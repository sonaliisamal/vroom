const mongoose = require('mongoose');

// Define a simple function to generate a unique booking ID (e.g., BR-123456)
const generateBookingId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `BR-${result}`;
};

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true,
        default: generateBookingId, // Auto-generate upon creation
        immutable: true // Prevent modification after creation
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the User model
        required: [true, 'Booking must belong to a user']
    },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car', // References the Car model
        required: [true, 'Booking must be for a car']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    startTime: {
        type: String, // Storing time as a string (e.g., "09:00", "14:30") is often simpler in Mongoose
        required: [true, 'Start time is required']
    },
    endTime: {
        type: String,
        required: [true, 'End time is required']
    },
    totalRent: {
        type: Number,
        required: [true, 'Total rent amount is required'],
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
    },
    // Used for payment gateway timer logic (e.g., user must pay within 30 seconds)
    expiresAt: {
        type: Date,
        // Optional: Set default 30 seconds after creation if status is 'pending'
    }
}, {
    timestamps: true
});

// ⏳ Pre-Save Hook for ExpiresAt Field
// This is a common pattern for implementing a payment window
bookingSchema.pre('save', function(next) {
    // Only calculate expiresAt if it's a new pending booking and expiresAt isn't set
    if (this.isNew && this.status === 'pending' && !this.expiresAt) {
        // Sets the expiration time to 30 seconds from now
        this.expiresAt = Date.now() + 30 * 1000; // 30 seconds in milliseconds
    }
    next();
});

// Optionally, create a TTL (Time-To-Live) index on `expiresAt`
// This instructs MongoDB to automatically delete documents 
// when the `expiresAt` date is reached (useful for clearing abandoned 'pending' bookings).
// Note: This must be done on the MongoDB server side or using a Mongoose index creation:
// bookingSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Booking', bookingSchema);
