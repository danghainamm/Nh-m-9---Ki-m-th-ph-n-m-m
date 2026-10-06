const UserModel = require('../models/KHModel');

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,}$/;

const renderChangePassword = (res, error = null, success = null) => {
  return res.render('changePassword', { error, success });
};

const getChangePassword = (req, res) => {
  return renderChangePassword(res);
};

const postChangePassword = async (req, res) => {
  try {
    const userId = req.session && req.session.user && req.session.user.maKhachHang;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!userId) {
      return renderChangePassword(res, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
    }

    if (![currentPassword, newPassword, confirmPassword].every(value => typeof value === 'string' && value.length > 0 && value.length <= 128)) {
      return renderChangePassword(res, 'Vui lòng nhập đầy đủ thông tin!');
    }

    if (!PASSWORD_PATTERN.test(newPassword)) {
      return renderChangePassword(
        res,
        'Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa và ký tự đặc biệt!'
      );
    }

    if (newPassword !== confirmPassword) {
      return renderChangePassword(res, 'Mật khẩu nhập lại không khớp!');
    }

    const isValid = await UserModel.checkPassword(userId, currentPassword);
    if (!isValid) {
      return renderChangePassword(res, 'Mật khẩu hiện tại không đúng!');
    }

    const isUpdated = await UserModel.updatePassword(userId, newPassword);
    if (!isUpdated) {
      return renderChangePassword(res, 'Không thể cập nhật mật khẩu. Vui lòng thử lại!');
    }

    return renderChangePassword(res, null, 'Đổi mật khẩu thành công!');
  } catch (err) {
    console.error('Change password error:', err);
    return renderChangePassword(res, 'Có lỗi xảy ra, vui lòng thử lại!');
  }
};

module.exports = {
  getChangePassword,
  postChangePassword
};
