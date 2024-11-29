// models/Member.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Member', memberSchema);
