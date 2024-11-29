// models/Loan.js
const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    borrowingDate: {
        type: Date,
        default: Date.now
    },
    returnDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Borrowing', borrowingSchema);
