const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connect to MongoDB Atlas using the environment variable
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        
        // Exit process with failure code if connection fails
        process.exit(1);
    }
};

module.exports = connectDB;