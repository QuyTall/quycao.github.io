const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Book = require('../models/Book');

// Cấu hình multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Đường dẫn lưu ảnh
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên file duy nhất
    }
});

const upload = multer({ storage });

// Lấy danh sách sách
router.get('/', async (req, res) => {
    try {
        const { search, genre } = req.query; // Tìm kiếm theo `title` hoặc lọc theo `genre`
        const filter = {};

        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }
        if (genre) {
            filter.genre = genre;
        }

        const books = await Book.find(filter);
        res.render('layout', {
            content: 'book/bookList',
            books,
            genre: genre || '' // Truyền giá trị lọc về view
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sách:', error);
        res.status(500).send('Lỗi server.');
    }
});

// Hiển thị biểu mẫu thêm sách
router.get('/add', (req, res) => {
    res.render('layout', { content: 'book/addBook' });
});

// Thêm sách
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { title, author, genre, year, available } = req.body;

        const newBook = new Book({
            title,
            author,
            genre,
            year: parseInt(year),
            available: parseInt(available),
            image: req.file ? '/images/' + req.file.filename : null // Lưu đường dẫn ảnh
        });

        await newBook.save();
        res.redirect('/books');
    } catch (err) {
        console.error('Lỗi khi thêm sách:', err);
        res.status(500).send('Lỗi thêm sách.');
    }
});

// Lấy chi tiết sách
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send('Sách không tồn tại.');
        }
        res.render('layout', { content: 'book/bookDetail', book });
    } catch (err) {
        console.error('Lỗi lấy thông tin sách:', err);
        res.status(500).send('Lỗi server.');
    }
});

// Hiển thị biểu mẫu sửa sách
router.get('/edit/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send('Sách không tồn tại.');
        }
        res.render('layout', { content: 'book/editBook', book });
    } catch (err) {
        console.error('Lỗi lấy thông tin sách:', err);
        res.status(500).send('Lỗi server.');
    }
});

// Cập nhật sách
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, author, genre, year, available } = req.body;

        const updatedBook = {
            title,
            author,
            genre,
            year: parseInt(year),
            available: parseInt(available),
        };

        if (req.file) {
            updatedBook.image = '/images/' + req.file.filename; // Cập nhật ảnh mới nếu có
        }

        await Book.findByIdAndUpdate(req.params.id, updatedBook, { new: true });
        res.redirect('/books/' + req.params.id); // Quay lại trang chi tiết sách
    } catch (err) {
        console.error('Lỗi cập nhật sách:', err);
        res.status(500).send('Lỗi cập nhật sách.');
    }
});

// Xóa sách
router.post('/delete/:id', async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.redirect('/books'); // Quay lại danh sách sách
    } catch (err) {
        console.error('Lỗi xóa sách:', err);
        res.status(500).send('Lỗi xóa sách.');
    }
});

module.exports = router;
