const express = require('express');
const router = express.Router();
const Member = require('../models/Member'); // Giả sử bạn đã có mô hình Member

// Hiển thị danh sách thành viên
router.get('/', async (req, res) => {
    try {
        const members = await Member.find();
        res.render('layout', { content: 'member/memberList', members });
    } catch (err) {
        console.error('Lỗi lấy danh sách thành viên:', err);
        res.status(500).send('Lỗi lấy danh sách thành viên.');
    }
});

// Hiển thị biểu mẫu thêm thành viên
router.get('/add', (req, res) => {
    res.render('layout', { content: 'member/addMember' });
});

// Xử lý thêm thành viên
router.post('/add', async (req, res) => {
    try {
        const newMember = new Member({
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
            password: req.body.password // Đảm bảo mã hóa mật khẩu trước khi lưu
        });
        await newMember.save();
        res.redirect('/members');
    } catch (err) {
        console.error('Lỗi thêm thành viên:', err);
        res.status(500).send('Lỗi thêm thành viên.');
    }
});

// Hiển thị biểu mẫu sửa thành viên
router.get('/edit/:id', async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).send('Thành viên không tồn tại.');
        }
        res.render('layout', { content: 'member/editMember', member });
    } catch (err) {
        console.error('Lỗi lấy thông tin thành viên để sửa:', err);
        res.status(500).send('Lỗi lấy thông tin thành viên.');
    }
});

// Xử lý cập nhật thành viên
router.post('/edit/:id', async (req, res) => {
    try {
        const updatedMember = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
            // Không cập nhật mật khẩu nếu không cần thiết
        };
        await Member.findByIdAndUpdate(req.params.id, updatedMember, { new: true });
        res.redirect('/members');
    } catch (err) {
        console.error('Lỗi cập nhật thành viên:', err);
        res.status(500).send('Lỗi cập nhật thành viên.');
    }
});

// Xóa thành viên
router.post('/delete/:id', async (req, res) => {
    try {
        await Member.findByIdAndDelete(req.params.id);
        res.redirect('/members');
    } catch (err) {
        console.error('Lỗi xóa thành viên:', err);
        res.status(500).send('Lỗi xóa thành viên.');
    }
});

module.exports = router;