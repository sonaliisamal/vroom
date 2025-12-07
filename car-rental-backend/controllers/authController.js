const bcrypt = require('bcrypt');
const User = require('../models/User'); // Assumed User model location

// 🔒 Signup Logic
exports.signup = async (req, res) => {
    try {
        const { name, email, password, ageConfirmed, licenseConfirmed } = req.body;

        // 1. Validation: Check strict requirements
        if (!ageConfirmed || !licenseConfirmed) {
            return res.status(400).json({ 
                message: 'You must confirm your age and license eligibility to sign up.' 
            });
        }

        // 2. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create the user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            ageConfirmed,
            licenseConfirmed
        });

        if (user) {
            // Optional: Log them in immediately after signup
            req.session.user = { id: user._id, name: user.name, email: user.email };
            
            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

// 🔑 Login Logic
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ email });

        // 2. Verify user exists and password matches
        if (user && (await bcrypt.compare(password, user.password))) {
            
            // 3. Start Session
            // Store minimal user info in the session object
            req.session.user = {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin // Useful if you have admin roles
            };

            res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// 🚪 Logout Logic
exports.logout = (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again' });
        }
        
        // Clear the cookie client-side (name depends on your express-session config, default is usually 'connect.sid')
        res.clearCookie('connect.sid'); 
        res.status(200).json({ message: 'Logout successful' });
    });
};