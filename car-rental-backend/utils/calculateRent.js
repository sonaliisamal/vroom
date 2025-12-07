/**
 * Calculates the total rental price based on days and daily rate.
 * Applies a discount for rentals of 7 days or longer.
 * 
 * @param {number} pricePerDay - The daily rental rate of the car.
 * @param {number} days - The number of days the car is rented.
 * @returns {number} - The final calculated price (rounded to 2 decimals).
 */
const calculateRent = (pricePerDay, days) => {
    if (days <= 0) return 0;

    // 1. Calculate Base Price
    let total = pricePerDay * days;

    // 2. Apply Dynamic Discount for Long Rentals (7+ days)
    if (days >= 7) {
        // Logic: Start at 1% for 7 days, increase by 1% per day, cap at 10%
        // Example: 7 days = 1%, 10 days = 4%, 16+ days = 10%
        let discountPercent = days - 6; 

        if (discountPercent > 10) {
            discountPercent = 10;
        }

        const discountAmount = (total * discountPercent) / 100;
        total -= discountAmount;
    }

    // Return price fixed to 2 decimal places
    return parseFloat(total.toFixed(2));
};

module.exports = calculateRent;