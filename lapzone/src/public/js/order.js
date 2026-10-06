// Hàm xử lý khi click "Mua ngay"
function buyNow(event, maSanPham, tenSanPham, giaBan) {
    event.preventDefault();
    
    // Hiển thị modal nhập thông tin khách hàng
    showOrderModal(maSanPham, tenSanPham, giaBan);
  }
  
  // Hàm hiển thị modal đặt hàng
  function showOrderModal(maSanPham, tenSanPham, giaBan) {
    // Tạo HTML cho modal
    const modal = document.createElement('div');
    modal.id = 'orderModal';
    modal.className = 'order-modal';
    
    const quantity = 1; // Mặc định mua 1 sản phẩm
    const totalPrice = giaBan * quantity;
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Đặt hàng</h2>
          <span class="close" onclick="closeOrderModal()">&times;</span>
        </div>
        <div class="modal-body">
          <div class="order-info">
            <h3>Thông tin sản phẩm</h3>
            <p><strong>Sản phẩm:</strong> ${tenSanPham}</p>
            <p><strong>Giá:</strong> ${formatPrice(giaBan)} VND</p>
            <p><strong>Số lượng:</strong> ${quantity}</p>
            <p><strong>Tổng giá trị:</strong> ${formatPrice(totalPrice)} VND</p>
          </div>
          
          <form id="orderForm">
            <h3>Thông tin giao hàng</h3>
            
            <div class="form-group">
              <label for="hoTen">Họ và tên *</label>
              <input type="text" id="hoTen" name="hoTen" required placeholder="Nhập họ và tên">
            </div>
            
            <div class="form-group">
              <label for="soDienThoai">Số điện thoại *</label>
              <input type="tel" id="soDienThoai" name="soDienThoai" required placeholder="Nhập số điện thoại">
            </div>
            
            <div class="form-group">
              <label for="email">Email *</label>
              <input type="email" id="email" name="email" required placeholder="Nhập email">
            </div>
            
            <div class="form-group">
              <label for="diaChi">Địa chỉ giao hàng *</label>
              <input type="text" id="diaChi" name="diaChi" required placeholder="Nhập địa chỉ giao hàng">
            </div>
            
            <div class="form-group">
              <label for="phuongThuc">Phương thức thanh toán *</label>
              <select id="phuongThuc" name="phuongThuc" required>
                <option value="">-- Chọn phương thức --</option>
                <option value="Tiền mặt">Tiền mặt khi nhận hàng</option>
                <option value="Chuyển khoản">Chuyển khoản ngân hàng</option>
                <option value="Ví điện tử">Ví điện tử</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="ghiChu">Ghi chú (Tùy chọn)</label>
              <textarea id="ghiChu" name="ghiChu" placeholder="Nhập ghi chú..." rows="3"></textarea>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn-cancel" onclick="closeOrderModal()">Hủy</button>
              <button type="submit" class="btn-submit" onclick="submitOrder(event, '${maSanPham}', ${quantity}, ${totalPrice})">Xác nhận đặt hàng</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
  
  // Hàm đóng modal
  function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
      modal.remove();
    }
  }
  
  // Hàm gửi đơn hàng
  function submitOrder(event, maSanPham, soLuong, tongGiaTri) {
    event.preventDefault();
    
    const hoTen = document.getElementById('hoTen').value;
    const soDienThoai = document.getElementById('soDienThoai').value;
    const email = document.getElementById('email').value;
    const diaChi = document.getElementById('diaChi').value;
    const phuongThuc = document.getElementById('phuongThuc').value;
    const ghiChu = document.getElementById('ghiChu').value;
    const tenSanPham = document.querySelector('h1').textContent;
    
    // Kiểm tra dữ liệu
    if (!hoTen || !soDienThoai || !email || !diaChi || !phuongThuc) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }
    
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Email không hợp lệ!');
      return;
    }
    
    // Kiểm tra số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(soDienThoai)) {
      alert('Số điện thoại phải có 10-11 chữ số!');
      return;
    }
    
    // Hiển thị thông báo đang xử lý
    const submitBtn = event.target;
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';
    
    // Gửi dữ liệu lên server
    fetch('/order/dat-hang', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hoTen,
        soDienThoai,
        email,
        diaChi,
        phuongThuc,
        ghiChu,
        maSanPham,
        soLuong,
        tongGiaTri,
        tenSanPham
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Đặt hàng thành công!\nMã đơn hàng: ' + data.order.maDonHang);
        closeOrderModal();
        // Có thể chuyển hướng đến trang xác nhận hoặc trang chủ
        // window.location.href = '/';
      } else {
        alert('Lỗi: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Lỗi:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
  }
  
  // Hàm định dạng giá tiền
  function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
  }
  
  // Đóng modal khi click bên ngoài
  document.addEventListener('click', function(event) {
    const modal = document.getElementById('orderModal');
    if (modal && event.target === modal) {
      closeOrderModal();
    }
  });