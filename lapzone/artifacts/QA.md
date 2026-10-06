# Kết quả kiểm tra Lapzone

Ngày kiểm tra: 05/10/2026. Web local: http://127.0.0.1:8080/.

## Kiểm thử tự động

108/108 ca đạt. Chạy lại bằng `node scripts/test-web.js` hoặc `npm test` tại thư mục project. Chi tiết từng ca và thời điểm chạy nằm trong `test-results.json` cùng thư mục này.

Bộ kiểm thử dùng database tạm riêng và cổng HTTP riêng. Các thao tác tạo/xóa, thay đổi mật khẩu, nhập kho và thử đơn hàng không chạy trên database sử dụng của bạn. Database tạm được xóa sau khi kết thúc bình thường.

| Nhóm | Những tình huống đã kiểm tra |
| --- | --- |
| Tài khoản | Đăng nhập, chuyển mật khẩu cũ sang scrypt, đăng ký, đổi mật khẩu, khóa tài khoản đang có phiên |
| Phân quyền | Chặn khách hàng vào quản trị/API, chặn đọc/hủy/thanh toán đơn người khác, chặn POST từ trang khác |
| Mua hàng | Giá do server tính, số lượng sai, tồn kho thiếu, địa chỉ khác tài khoản, chọn đúng sản phẩm giỏ hàng |
| Giao dịch | Hai khách mua món cuối chỉ một người thành công; thất bại không để đơn/địa chỉ dở dang; hủy hoàn kho một lần |
| Quản trị | Thêm/sửa/xóa sản phẩm, nhập/xuất kho, tạo đơn có chi tiết, lọc trạng thái, bảo vệ lịch sử khách hàng/sản phẩm |
| Import kho | Nhiều dòng hợp lệ, tồn âm, mã lặp, mã không tồn tại và rollback toàn bộ file |
| Thanh toán demo | Khách gửi yêu cầu chờ xác nhận, quản trị xác nhận, không xác nhận đơn hủy hoặc của khách khác |
| Đánh giá/hồ sơ | Chỉ đánh giá đơn hoàn thành, chống gửi trùng đồng thời, giới hạn sao, email trùng, địa chỉ đơn không đổi theo hồ sơ |
| Báo cáo | Doanh thu và số đã bán chỉ tính đơn hoàn thành |

66 file JavaScript kiểm tra cú pháp thành công; 25 template EJS biên dịch thành công. Kiểm tra whitespace của các file thay đổi do đợt sửa này đạt.

## Kiểm tra trực tiếp trình duyệt

- Đăng nhập khách hàng và quản trị bằng tài khoản mẫu.
- Xem trang chủ, chi tiết sản phẩm, form mua ngay và hồ sơ; mở modal cập nhật hồ sơ.
- Thay đổi số lượng giỏ hàng rồi trả lại số lượng ban đầu, chọn sản phẩm và mở checkout.
- Form tạo đơn quản trị tự tính 2 sản phẩm giá 15.990.000đ thành 31.980.000đ.
- Lọc đơn đang xử lý nhận đúng đơn chờ xác nhận.
- Lọc kho sắp hết chỉ hiển thị các dòng tồn dưới 10; chuyển sang hết hàng.
- Kiểm tra chiều rộng 390px ở trang chủ, chi tiết/mua hàng, giỏ, hồ sơ, đăng ký, đơn của tôi và các trang quản trị. Trang rộng có bảng cho phép cuộn trong vùng bảng.
- Trang chủ có 62 ảnh, không phát hiện ảnh hỏng; không thấy lỗi JavaScript ở các trang vừa kiểm tra.

Các thao tác đặt/hủy đơn và đổi mật khẩu được kiểm tra tự động trong database tạm. Kiểm tra giao diện trên database đang chạy không tạo đơn mới.

## Giới hạn

Đây là bản chạy thử local đã sửa các lỗi tìm thấy trong phạm vi trên; kết quả không chứng minh mọi tình huống có thể xảy ra đều không có lỗi. Chưa tích hợp thanh toán ngân hàng thật, triển khai HTTPS, session store lâu dài, giới hạn thử đăng nhập hoặc vận hành sao lưu. Icon và công cụ Excel trên trình duyệt phụ thuộc CDN. Xem README để chạy và dùng chức năng import đúng định dạng.
