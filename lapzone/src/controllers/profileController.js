const profileModel = require('../models/profileModel');

const getProfile = async (req, res) => {
    if (!req.session.user) return res.redirect('/');

    try {
        const maKH = req.session.user.maKhachHang;
        const userData = await profileModel.getOne(maKH);

        res.render('profile', {
            user: userData,
            title: 'Thông tin cá nhân'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi Server");
    }
};

const updateProfile = async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    try {
        const maKH = req.session.user.maKhachHang;
        const { hoTen, soDienThoai, email, diaChiNhanHang } = req.body;
        if (![hoTen, soDienThoai, email, diaChiNhanHang].every(value => typeof value === 'string' && value.trim().length > 0 && value.length <= 255)) {
            return res.status(400).send('Vui lòng nhập đầy đủ thông tin hợp lệ.');
        }

        //kiểm tra lại dữ liệu
        const nameRegex = /^[\p{L}\s]+$/u;
        if (!nameRegex.test(hoTen)) {
            return res.status(400).send("Lỗi: Họ tên không được chứa số hoặc ký tự đặc biệt!");
        }

        if (!/^0[0-9]{9}$/.test(soDienThoai)) {
            return res.status(400).send("Lỗi: Số điện thoại phải gồm 10 chữ số!");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send("Lỗi: Định dạng email không hợp lệ!");
        }

        if (!diaChiNhanHang || diaChiNhanHang.trim() === '') {
            return res.status(400).send("Lỗi: Địa chỉ không được để trống!");
        }

        await profileModel.update(maKH, {
            hoTen,
            soDienThoai,
            email,
            diaChiNhanHang
        });

        //cập nhật lại session
        if (req.session.user) {
            req.session.user.hoTen = hoTen;
            req.session.user.name = hoTen;
            req.session.user.soDienThoai = soDienThoai;
            req.session.user.email = email;
            req.session.user.diaChiNhanHang = diaChiNhanHang;
        }

        res.redirect('/profile');

    } catch (error) {
        console.error(error);
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).send(error.code === 'ER_DUP_ENTRY' ? 'Email hoặc số điện thoại đã được tài khoản khác sử dụng.' : 'Lỗi khi cập nhật thông tin');
    }
};

module.exports = { getProfile, updateProfile };
