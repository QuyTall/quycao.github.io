// routes/employeeRouter.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Hiển thị danh sách nhân viên
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.render('layout', { content: 'employee/employeeList', employees });
    } catch (err) {
        res.status(500).send('Lỗi khi lấy danh sách nhân viên');
    }
});

// Thêm nhân viên mới
router.get('/add', (req, res) => {
    res.render('layout', { content: 'employee/addEmployee' });
});

// Xử lý thêm nhân viên
router.post('/add', async (req, res) => {
    try {
        const newEmployee = new Employee({
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
            password: req.body.password // Đảm bảo mã hóa mật khẩu trước khi lưu
        });
        await newEmployee.save();
        res.redirect('/employees'); // Quay lại danh sách nhân viên
    } catch (err) {
        console.error('Lỗi thêm nhân viên:', err);
        res.status(500).send('Lỗi thêm nhân viên.');
    }
});
// Hiển thị biểu mẫu sửa nhân viên
router.get('/edit/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).send('Nhân viên không tồn tại.');
        }
        res.render('layout', { content: 'employee/editEmployee', employee });
    } catch (err) {
        console.error('Lỗi lấy thông tin nhân viên để sửa:', err);
        res.status(500).send('Lỗi lấy thông tin nhân viên.');
    }
});
// Xử lý cập nhật nhân viên
router.post('/edit/:id', async (req, res) => {
    try {
        const updatedEmployee = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
            // Không cập nhật mật khẩu nếu không cần thiết
        };
        await Employee.findByIdAndUpdate(req.params.id, updatedEmployee, { new: true });
        res.redirect('/employees'); // Quay lại danh sách nhân viên
    } catch (err) {
        console.error('Lỗi cập nhật nhân viên:', err);
        res.status(500).send('Lỗi cập nhật nhân viên.');
    }
});

// Xóa nhân viên
router.post('/delete/:id', async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.redirect('/employees'); // Quay lại danh sách nhân viên
    } catch (err) {
        console.error('Lỗi xóa nhân viên:', err);
        res.status(500).send('Lỗi xóa nhân viên.');
    }
});
module.exports = router;