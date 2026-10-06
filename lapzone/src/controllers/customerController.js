
const customerModel = require('../models/KHModel');

const list = async (req, res) => {
    try {
        const search = req.query.search || '';
        const status = req.query.status || 'all';
        let page = Number.isSafeInteger(Number(req.query.page)) ? Number(req.query.page) : 1;
        if (page < 1) page = 1;

        const limit = 6;
        const offset = (page - 1) * limit;

        const result = await customerModel.getCustomersFiltered({ search, status, limit, offset });

        const totalPages = Math.ceil(result.totalItems / limit);

        return res.render('customer_list', {
            data: result.data,
            quanTriVien: req.session.user,
            currentPage: page,
            totalPages: totalPages,
            search: search,
            status: status
        });

    } catch (e) {
        console.log(e);
        res.send('Lỗi lấy dữ liệu');
    }
};

const profile = async (req, res) => {
    try {
        const slug = req.params.slug;
        const user = await customerModel.getCustomerById(slug);

        if (!user) return res.send('Không tìm thấy user');

        return res.render('customer_profile', {
            user: user,
            quanTriVien: req.session.user
        });
    } catch (e) {
        console.log(e);
        return res.send('Lỗi');
    }
};

const reverseStatus = async (req, res) => {
    try {
        const id = req.params.slug;
        const page = req.query.page || 1;
        const search = req.query.search || '';
        const status = req.query.status || 'all';

        const user = await customerModel.getCustomerById(id);

        if (!user) {
            return res.send('Người dùng không tồn tại!');
        }
        let newStatus = '';
        if (user.trangThai === 'Hoạt động') {
            newStatus = 'Đã khóa';
        } else {
            newStatus = 'Hoạt động';
        }

        await customerModel.updateStatus(id, newStatus);

        return res.redirect(`/quanlytaikhoan?page=${page}&search=${search}&status=${status}`);

    } catch (e) {
        console.log(e);
        res.send('Lỗi cập nhật trạng thái');
    }
};

const deleteUser = async (req, res) => {
    try {
        const id = req.params.slug;
        const page = req.query.page || 1;
        const search = req.query.search || '';
        const status = req.query.status || 'all';

        await customerModel.deleteCustomer(id);

        return res.redirect(`/quanlytaikhoan?page=${page}&search=${search}&status=${status}`);

    } catch (e) {
        console.log(e);
        res.status(e.status || 500).send(e.status ? e.message : 'Không thể xóa tài khoản.');
    }
};

module.exports = { list, profile, reverseStatus, deleteUser };
