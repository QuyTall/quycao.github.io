// models/Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['staff', 'manager', 'librarian'],
        default: 'staff'
    },
    phone: {
        type: String,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
