// 📦 Configuration and Dependencies
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Import DB connection function
const MongoStore = require('connect-mongo'); // Session store for MongoDB

// 🛣️ Route Imports
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// ⚙️ Load Environment Variables
// It's a good practice to use a .env file for configuration like the MongoDB URI, JWT secret, etc.
dotenv.config();

// 💾 Connect to Database
connectDB();

// 🚀 Initialize App
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI; // Assuming this is set in your .env file
const SESSION_SECRET = process.env.SESSION_SECRET || 'supersecretkey';

// --- Global Middleware ---

// 🛡️ Enable CORS
// Configure CORS for a specific frontend origin and to allow credentials (for sessions/cookies)
const corsOptions = {
    // Replace with your actual frontend URL in production
    origin: 'http://localhost:3000', 
    credentials: true,
};
app.use(cors(corsOptions));

// 📝 Body Parser (Built-in Express)
app.use(express.json()); // Allows server to accept JSON data in the request body
app.use(express.urlencoded({ extended: true })); // For form data

// 🍪 Express Session
app.use(session({
    secret: SESSION_SECRET,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something is stored
    store: MongoStore.create({
        mongoUrl: MONGO_URI,
        collectionName: 'sessions', // Name of the session collection in MongoDB
        ttl: 14 * 24 * 60 * 60, // 14 days in seconds
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
        httpOnly: true, // Prevent client-side JS from reading the cookie
        sameSite: 'lax', // Protects against CSRF in modern browsers
    }
}));

// --- Routes ---

// 🏠 Default Route
app.get('/', (req, res) => {
    res.send('Car Rental API is running!');
});

// 🔄 Use Imported Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);

// --- Global Error Handler Middleware ---

// 🚨 Custom Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack); // Log error stack for debugging
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Server Error';

    res.status(statusCode).json({
        success: false,
        message: message,
        // Only include stack trace in development for security
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, 
    });
});

// 🌐 Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const startBookingScheduler = require('./utils/bookingTimer');

// ... other imports and app setup ...

// Start the background timer
startBookingScheduler();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});