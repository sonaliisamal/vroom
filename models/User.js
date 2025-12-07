const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Do not return password by default in queries
    },
    ageConfirmed: {
        type: Boolean,
        required: true,
        validate: {
            validator: function(v) {
                return v === true;
            },
            message: 'You must contain that you are 18 or older.'
        }
    },
    licenseConfirmed: {
        type: Boolean,
        required: true,
        validate: {
            validator: function(v) {
                return v === true;
            },
            message: 'You must confirm that you hold a valid driving license.'
        }
    }
}, {
    timestamps: true
});

// 🔒 Encrypt password using bcrypt before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 🔑 Method to match user entered password to hashed password in DB
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);