async function updateOrder() {
    const form = document.getElementById('editForm');

    // Lấy dữ liệu từ data attributes
    const maDonHang = form.dataset.maDonHang;
    const maKhachHang = form.dataset.maKhachHang;
    const maDiaChi = form.dataset.maDiaChi || null;
    const tongGiaTri = parseFloat(form.dataset.tongGiaTri) || 0;
    const ghiChu = form.dataset.ghiChu || '';

    const orderData = {
      maKhachHang: maKhachHang,
      maDiaChi: maDiaChi,
      tongGiaTri: tongGiaTri,
      trangThai: document.getElementById('trangThai').value,
      phuongThucThanhToan: document.getElementById('trangThaiThanhToan').value,
      ghiChu: ghiChu
    };


    try {
      const response = await fetch(`/quanlydonhang/api/orders/${maDonHang}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        alert('Cập nhật đơn hàng thành công!');
        window.location.href = '/quanlydonhang';
      } else {
        alert(result.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Có lỗi xảy ra khi cập nhật đơn hàng');
    }
  }
