const Booking = require('../models/Booking'); // Adjust path to your Booking model
const Car = require('../models/Car');         // Adjust path to your Car model

/**
 * Checks for expired 'pending' bookings and cancels them.
 * Frees up the associated car inventory.
 */
const checkExpiredBookings = async () => {
    try {
        const now = new Date();

        // 1. Find all bookings that are pending AND expired
        const expiredBookings = await Booking.find({
            status: 'pending',
            expiresAt: { $lt: now }
        });

        if (expiredBookings.length === 0) return;

        console.log(`Checking bookings: Found ${expiredBookings.length} expired pending bookings.`);

        // 2. Extract IDs for bulk updates
        const bookingIds = expiredBookings.map(b => b._id);
        const carIds = expiredBookings.map(b => b.car); // Assuming 'car' field stores the Car ID

        // 3. Auto-cancel the bookings
        await Booking.updateMany(
            { _id: { $in: bookingIds } },
            { status: 'cancelled' }
        );

        // 4. Free the car units (make them available)
        await Car.updateMany(
            { _id: { $in: carIds } },
            { isAvailable: true }
        );

        console.log(`✅ Auto-cancelled ${expiredBookings.length} bookings and released cars.`);

    } catch (error) {
        console.error('❌ Error in booking scheduler:', error);
    }
};

/**
 * Starts the interval timer.
 * Runs every 60 seconds (60000 ms).
 */
const startBookingScheduler = () => {
    // Run once immediately on server start (optional)
    checkExpiredBookings();

    // Set interval to run every minute
    setInterval(checkExpiredBookings, 60 * 1000);
    console.log('⏰ Booking expiration scheduler started...');
};

module.exports = startBookingScheduler;