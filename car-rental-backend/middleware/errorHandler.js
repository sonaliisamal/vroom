// 🚨 Custom Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    // 1. Log the error stack for debugging
    console.error(err.stack);

    // Determine the status code
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Server Error';

    // 2. Return JSON error response
    res.status(statusCode).json({
        success: false,
        message: message,
        // Only include stack trace in development mode for security
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

// ❓ Unknown Route Handler (404 Not Found)
const notFound = (req, res, next) => {
    // Create an Error object for unknown routes
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;

    // Pass the custom 404 error to the main error handler
    next(error); 
};


module.exports = {
    errorHandler,
    notFound,
};