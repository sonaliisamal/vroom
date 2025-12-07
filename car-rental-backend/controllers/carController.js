const Car = require('../models/Car');
const Booking = require('../models/Booking');

// 🚗 Get All Cars
// Returns the entire fleet regardless of availability
exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find();
        res.status(200).json(cars);
    } catch (error) {
        console.error('Error fetching cars:', error);
        res.status(500).json({ message: 'Server error fetching cars' });
    }
};

// 🔍 Search Available Cars
// Query Params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
exports.searchAvailableCars = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Please provide startDate and endDate' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // 1. Find bookings that overlap with the requested range
        // Logic: A booking overlaps if it starts BEFORE the request ends 
        // AND ends AFTER the request starts.
        const overlappingBookings = await Booking.find({
            status: { $ne: 'cancelled' }, // Ignore cancelled bookings
            $and: [
                { startDate: { $lt: end } },
                { endDate: { $gt: start } }
            ]
        });

        // 2. Map booking counts by Car ID
        // Create a dictionary: { carId: numberOfBookings }
        const bookingCounts = {};
        overlappingBookings.forEach(booking => {
            const carId = booking.carId.toString();
            bookingCounts[carId] = (bookingCounts[carId] || 0) + 1;
        });

        // 3. Fetch all cars
        // (Optional: You can add filters for carType or price here)
        const allCars = await Car.find();

        // 4. Filter cars where inventory exists
        // Available if: totalUnits > currentlyBooked count
        const availableCars = allCars.filter(car => {
            const bookedCount = bookingCounts[car._id.toString()] || 0;
            return car.totalUnits > bookedCount;
        });

        res.status(200).json({
            results: availableCars.length,
            cars: availableCars
        });

    } catch (error) {
        console.error('Error searching cars:', error);
        res.status(500).json({ message: 'Server error searching availability' });
    }
};