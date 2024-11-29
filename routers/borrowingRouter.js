const express = require('express');
const router = express.Router();
const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');
const Member = require('../models/Member');

// Hiển thị danh sách mượn sách
router.get('/', async (req, res) => {
    try {
        const search = req.query.search || '';  // Lấy giá trị search từ query params
        // Lấy danh sách các lượt mượn và thông tin sách, thành viên liên quan
        const borrowings = await Borrowing.find().populate('book').populate('member');
        const books = await Book.find();

        res.render('layout', { content: 'borrowing/borrowingList', borrowings, books, search });  // Truyền search vào đây
    } catch (err) {
        console.error('Lỗi lấy danh sách mượn sách:', err);
        res.status(500).send('Lỗi lấy danh sách mượn sách.');
    }
});

// Hiển thị biểu mẫu thêm giao dịch mượn sách
router.get('/add', async (req, res) => {
    try {
        const search = req.query.search || '';
        // Tìm sách theo tên hoặc tác giả có sẵn
        const books = await Book.find();

        // Lấy danh sách thành viên
        const members = await Member.find();

        res.render('layout', { content: 'borrowing/addBorrowing', books, members, search });
    } catch (err) {
        console.error('Lỗi lấy danh sách sách hoặc thành viên:', err);
        res.status(500).send('Lỗi lấy danh sách sách hoặc thành viên.');
    }
});

// Xử lý thêm giao dịch mượn sách
router.post('/add', async (req, res) => {
    try {
        const { member, book, borrowedDate } = req.body;

        // Kiểm tra nếu không có sách nào được chọn
        if (!book) {
            return res.status(400).send("Vui lòng chọn một cuốn sách.");
        }

        // Tạo bản ghi mượn sách
        const newBorrowing = new Borrowing({
            book: book,
            member: member,
            borrowedDate: borrowedDate
        });

        // Lưu bản ghi mượn sách
        await newBorrowing.save();

        // Cập nhật trạng thái sách là đã được mượn (không có sẵn nữa)
        await Book.findByIdAndUpdate(book, { available: false });

        res.redirect('/borrowings'); // Chuyển hướng về danh sách mượn sách
    } catch (err) {
        console.error('Lỗi mượn sách:', err);
        res.status(500).send('Lỗi mượn sách.');
    }
});



// Xử lý trả sách
router.post('/return/:id', async (req, res) => {
    try {
        const borrowingId = req.params.id;

        // Cập nhật ngày trả sách trong bản ghi mượn
        await Borrowing.findByIdAndUpdate(borrowingId, { returnDate: Date.now() });

        // Cập nhật trạng thái sách là có sẵn trở lại
        const borrowing = await Borrowing.findById(borrowingId);
        await Book.findByIdAndUpdate(borrowing.book, { available: true });

        res.redirect('/borrowings'); // Chuyển hướng đến trang danh sách mượn sách
    } catch (err) {
        console.error('Lỗi trả sách:', err);
        res.status(500).send('Lỗi trả sách.');
    }
});

module.exports = router;