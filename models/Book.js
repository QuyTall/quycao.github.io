const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    author: {
        type: String,
    },
    genre: {
        type: String,
    },
    year: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear()
    },
    available: {
        type: Number,
        min: 0
    },
    image: {
        type: String // Thêm trường để lưu đường dẫn ảnh
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);