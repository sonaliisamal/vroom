// 🛡️ Authentication Middleware
// Checks if the user has an active session
const protect = (req, res, next) => {
    // Check if session exists and contains user data
    if (req.session && req.session.user) {
        return next();
    }

    // ⛔ If no session found
    return res.status(401).json({ 
        message: 'Unauthorized: Please log in to access this resource' 
    });
};

module.exports = { protect };