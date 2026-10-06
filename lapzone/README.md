# lapzone

Web bán laptop dùng Express, EJS và MySQL.

## Chạy trên máy cá nhân

1. Cài Node.js và MySQL Server, bật dịch vụ MySQL. Workbench là công cụ quản lý tùy chọn.
2. Chạy `npm install` nếu chưa có thư mục `node_modules`.
3. Tạo file `.env` từ `.env.example`, điền mật khẩu MySQL của bạn vào `DB_PASSWORD`.
4. Chạy `node scripts/setup-db.js` (hoặc `npm run db:setup`). Lệnh này tạo database `lapzone`, không xóa database cũ. Chỉ nhập dữ liệu mẫu khi tất cả các bảng đều trống; nếu đã có dữ liệu thì giữ nguyên. Đây là lệnh khởi tạo, không phải migration cập nhật cấu trúc bảng cũ.
5. Chạy `node src/server.js` (hoặc `npm start`), mở địa chỉ server in ra trong terminal. Cổng mặc định là 8888; nếu `.env` có `PORT` thì dùng cổng đó.

Tài khoản mẫu sau khi khởi tạo:

| Vai trò | Tên đăng nhập | Mật khẩu |
| --- | --- | --- |
| Khách hàng | user1 | 123456 |
| Quản trị viên | admin | 123456 |

Dữ liệu và thông số sản phẩm là minh họa để chạy thử. Luồng thanh toán hiện là demo.

## Kiểm thử

Chạy `node scripts/test-web.js` hoặc `npm test` tại thư mục này. Bộ kiểm thử tạo database tên `lapzone_test_<thời gian>_<process>`, khởi tạo dữ liệu mẫu, chạy HTTP trên cổng riêng rồi xóa đúng database tạm đó. Tài khoản MySQL trong `.env` cần quyền tạo/xóa database thử. Không dùng database `lapzone` để thử đặt hàng, đổi mật khẩu, nhập kho hay xóa dữ liệu.

Kết quả được lưu vào `artifacts/test-results.json`. Các ca kiểm tra gồm đăng nhập/phân quyền, đăng ký/đổi mật khẩu, tìm kiếm, giỏ hàng, tính giá ở server, đặt/hủy đơn, hai người tranh mua sản phẩm cuối, thanh toán demo, quản lý sản phẩm/kho/khách hàng, nhập kho từ file, đánh giá và báo cáo doanh thu.

## Các luồng đã hoàn thiện cho chạy thử

- Mật khẩu tài khoản mới được băm bằng scrypt. Tài khoản mẫu dùng mật khẩu cũ được chuyển sang dạng băm khi đăng nhập thành công.
- Khách hàng chỉ xem/hủy/thanh toán đơn của mình. Các trang và API quản trị yêu cầu đúng vai trò; phiên của tài khoản bị khóa không được tiếp tục thao tác.
- Đặt đơn tính giá từ MySQL, lưu chi tiết và trừ tồn kho trong một giao dịch. Hủy đơn hợp lệ hoàn kho một lần; đơn đã giao/đã hủy không được khôi phục tùy ý.
- Tạo đơn ở quản trị có chọn khách hàng, sản phẩm, số lượng và người nhận. Tổng tiền được tính tự động; sửa đơn không thay đổi tổng tiền hoặc chủ sở hữu tùy ý.
- Người nhận của đơn mới được lưu riêng, tránh đổi lịch sử giao hàng khi cập nhật hồ sơ.
- Import Excel/CSV trong kho cập nhật tồn kho của sản phẩm đã có. Cột bắt buộc là `Mã sản phẩm`, `Tồn kho` hoặc `maSanPham`, `soLuongTon`; tối đa 500 dòng, mã không trùng, tồn kho nguyên không âm. Nếu bất kỳ dòng nào sai, toàn bộ file không được lưu. Thao tác này đặt tồn kho theo file, không cộng số lượng; dùng nút nhập hàng nếu muốn cộng.
- Bộ lọc kho chuyển lần lượt qua tất cả, sắp hết (<10), hết hàng. Doanh thu và số lượng đã bán chỉ tính đơn hoàn thành.
- Đã chỉnh bố cục cho điện thoại, sửa JavaScript dùng chung và hiển thị lỗi đăng ký rõ ràng.

## Phạm vi bản local

Thanh toán ngân hàng là mô phỏng: không có tài khoản nhận tiền/QR thật hoặc xác minh từ ngân hàng. Khách gửi yêu cầu xác nhận; quản trị mới xác nhận thanh toán. Không chuyển tiền thật khi thử.

Session hiện lưu trong bộ nhớ để chạy local và sẽ mất khi khởi động lại server. Trước khi đưa lên môi trường thật cần cấu hình session store, HTTPS, bảo vệ đăng nhập trước việc thử mật khẩu liên tục, sao lưu và cổng thanh toán thực tế. Các thư viện icon và đọc/xuất Excel trên trình duyệt tải từ CDN, nên cần Internet cho những phần này.
