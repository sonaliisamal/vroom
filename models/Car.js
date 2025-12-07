const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a car name'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Please specify the car type'],
        enum: {
            values: ['Mini', 'Standard', 'Compact', 'Economy', 'Van'],
            message: 'Type must be: Mini, Standard, Compact, Economy, or Van'
        }
    },
    capacity: {
        type: Number,
        required: [true, 'Please add seating capacity'],
        min: [1, 'Capacity must be at least 1']
    },
    pricePerDay: {
        type: Number,
        required: [true, 'Please add price per day'],
        min: [0, 'Price cannot be negative']
    },
    totalUnits: {
        type: Number,
        required: [true, 'Please specify total fleet size for this model'],
        min: 1
    },
    bookedUnits: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true,
    // Ensure virtuals are included when converting to JSON/Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 🧮 Computed Field: isAvailable
// Returns true if there is at least one unit left in the fleet
carSchema.virtual('isAvailable').get(function() {
    return this.bookedUnits < this.totalUnits;
});

module.exports = mongoose.model('Car', carSchema);