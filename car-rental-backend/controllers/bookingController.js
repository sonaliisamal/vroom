const Booking = require('../models/Booking');
const Car = require('../models/Car');
const { calculateRent } = require('../utils/calculateRent');
const { scheduleExpiration } = require('../utils/bookingTimeout');

// 📝 Create Booking
exports.createBooking = async (req, res) => {
    try {
        const { carId, startDate, endDate } = req.body;
        const userId = req.session.user.id; // Assumes session middleware

        // 1. Fetch Car and check availability
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (car.bookedUnits >= car.totalUnits) {
            return res.status(400).json({ message: 'Car is currently unavailable' });
        }

        // 2. Calculate Rent
        const totalRent = calculateRent(startDate, endDate, car.pricePerDay);

        // 3. Create Booking Object
        // Set expiresAt to 30 seconds from now
        const expiresAt = new Date(Date.now() + 30 * 1000);

        const booking = await Booking.create({
            user: userId,
            carId: car._id,
            startDate,
            endDate,
            totalRent,
            status: 'pending',
            expiresAt
        });

        // 4. Reserve Inventory (Increment bookedUnits)
        car.bookedUnits += 1;
        await car.save();

        // 5. Start the Countdown Timer (Utility)
        // If not paid in 30s, this utility will trigger cancellation
        scheduleExpiration(booking._id);

        res.status(201).json({
            message: 'Booking reserved! Please pay within 30 seconds.',
            booking
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating booking' });
    }
};

// 💳 Pay for Booking
exports.payBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking has expired or been cancelled' });
        }

        if (booking.status === 'paid') {
            return res.status(200).json({ message: 'Booking is already paid' });
        }

        // 1. Update status
        booking.status = 'paid';
        
        // 2. Remove expiration (Paid bookings do not expire)
        booking.expiresAt = null;
        
        await booking.save();

        res.status(200).json({ message: 'Payment successful! Booking confirmed.', booking });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing payment' });
    }
};

// ❌ Cancel Booking (Manual or Timeout)
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params; // or req.body depending on route
        
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only cancel if not already cancelled to avoid double-decrementing inventory
        if (booking.status !== 'cancelled') {
            
            // 1. Set status
            booking.status = 'cancelled';
            await booking.save();

            // 2. Release Inventory (Decrement bookedUnits)
            await Car.findByIdAndUpdate(booking.carId, { $inc: { bookedUnits: -1 } });
            
            return res.status(200).json({ message: 'Booking cancelled' });
        }

        res.status(400).json({ message: 'Booking is already cancelled' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error cancelling booking' });
    }
};

// 📂 Get User's Bookings
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.session.user.id })
            .populate('carId', 'model brand pricePerDay') // Optional: Show car details
            .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
};