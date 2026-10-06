// ===== TAB SWITCHING =====
function escapeOrderText(value) {
  const span = document.createElement('span');
  span.textContent = value == null ? '' : String(value);
  return span.innerHTML;
}
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    // Add active class to clicked tab
    this.classList.add('active');

    // Filter orders based on status
    const status = this.dataset.status;
    filterOrders(status);
  });
});

// ===== FILTER ORDERS FUNCTION =====
async function filterOrders(status) {
  try {
    let url = '/quanlydonhang/api/orders?';

    if (status === 'paid') {
      url += 'paymentStatus=Đã thanh toán';
    } else if (status === 'unpaid') {
      url += 'paymentStatus=Chờ xử lý';
    } else if (status === 'processing') {
      url += 'status=Chờ xử lý';
    }
    // 'all' không cần thêm query params

    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      renderOrders(result.data);
    } else {
      alert('Lỗi khi lọc đơn hàng');
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra khi lọc đơn hàng');
  }
}

// ===== SEARCH FUNCTIONALITY =====
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function (e) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchOrders(e.target.value);
  }, 500); // Debounce 500ms
});

document.getElementById('searchBtn').addEventListener('click', function () {
  const keyword = document.getElementById('searchInput').value;
  searchOrders(keyword);
});

async function searchOrders(keyword) {
  if (!keyword.trim()) {
    // Nếu không có từ khóa, load tất cả đơn hàng
    filterOrders('all');
    return;
  }

  try {
    const response = await fetch(`/quanlydonhang/api/orders?keyword=${encodeURIComponent(keyword)}`);
    const result = await response.json();

    if (result.success) {
      renderOrders(result.data);
    } else {
      alert('Lỗi khi tìm kiếm đơn hàng');
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra khi tìm kiếm');
  }
}

// ===== RENDER ORDERS TO TABLE =====
function renderOrders(orders) {
  const tbody = document.getElementById('orderTableBody');

  if (!orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Không có đơn hàng nào</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(order => createOrderRow(order)).join('');
}

function createOrderRow(order) {
  const safeId = encodeURIComponent(order.maDonHang).replace(/'/g, '%27');
  const date = new Date(order.ngayTao).toLocaleDateString('vi-VN');
  const statusBadge = getStatusBadge(order.trangThai);
  const paymentBadge = getPaymentBadge(order.trangThaiThanhToan);
  const deliveryBadge = getDeliveryBadge(order.trangThaiGiaoHang);
  const total = Number(order.tongTien || 0).toLocaleString('vi-VN') + 'đ';

  let actionButtons = `
      <button class="btn-action btn-view" onclick="viewOrder('${safeId}')">Chi tiết</button>
    `;

  if (order.trangThai !== 'Đã hủy') {
    actionButtons += `
        <button class="btn-action btn-edit" onclick="editOrder('${safeId}')">Sửa</button>
        <button class="btn-action btn-delete" onclick="deleteOrder('${safeId}')">Hủy</button>
      `;
  }

  return `
      <tr>
        <td>#${escapeOrderText(order.maDonHang)}</td>
        <td>${date}</td>
        <td>${escapeOrderText(order.tenKhachHang)}</td>
        <td><strong>${escapeOrderText(order.tenNguoiNhan || order.tenKhachHang)}</strong></td>
        <td>${statusBadge}</td>
        <td>${paymentBadge}</td>
        <td>${deliveryBadge}</td>
        <td>${total}</td>
        <td>${actionButtons}</td>
      </tr>
    `;
}

// ===== GET BADGE HTML =====
function getStatusBadge(status) {
  const badges = {
    'Đã xác nhận': '<span class="status-badge status-confirmed">Đã xác nhận</span>',
    'Chờ xử lý': '<span class="status-badge status-pending">Chờ xử lý</span>',
    'Đã hủy': '<span class="status-badge status-cancelled">Đã hủy</span>'
  };
  return badges[status] || `<span class="status-badge">${escapeOrderText(status)}</span>`;
}

function getPaymentBadge(payment) {
  if (!payment) return '-';
  const badges = {
    'Đã thanh toán': '<span class="payment-badge payment-paid">Đã thanh toán</span>',
    'Chờ xử lý': '<span class="payment-badge payment-pending">Chờ xử lý</span>'
  };
  return badges[payment] || `<span>${escapeOrderText(payment)}</span>`;
}

function getDeliveryBadge(delivery) {
  if (!delivery) return '-';
  const badges = {
    'Đã giao': '<span class="delivery-badge delivery-done">Đã giao</span>',
    'Đã giao hàng': '<span class="delivery-badge delivery-done">Đã giao hàng</span>',
    'Chưa giao hàng': '<span class="delivery-badge delivery-pending">Chưa giao hàng</span>'
  };
  return badges[delivery] || `<span>${escapeOrderText(delivery)}</span>`;
}

// ===== VIEW ORDER DETAILS =====
function viewOrder(maDonHang) {
  window.location.href = `/quanlydonhang/chitiet/${maDonHang}`;
}

// ===== EDIT ORDER =====
function editOrder(maDonHang) {
  window.location.href = `/quanlydonhang/sua/${maDonHang}`;
}

// ===== DELETE ORDER =====
async function deleteOrder(maDonHang) {
  if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${maDonHang}?`)) {
    return;
  }

  try {
    const response = await fetch(`/quanlydonhang/api/orders/${maDonHang}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.success) {
      alert('Hủy đơn hàng thành công!');
      // Reload lại danh sách đơn hàng
      window.location.reload();
    } else {
      alert(result.message || 'Có lỗi xảy ra khi xóa đơn hàng');
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra khi xóa đơn hàng');
  }
}

// ===== CREATE NEW ORDER =====
function createOrder() {
  window.location.href = '/quanlydonhang/tao';
}

// ===== UPDATE ORDER STATUS =====
async function updateOrderStatus(maDonHang, trangThai) {
  try {
    const response = await fetch(`/quanlydonhang/api/orders/${maDonHang}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ trangThai })
    });

    const result = await response.json();

    if (result.success) {
      alert('Cập nhật trạng thái thành công!');
      window.location.reload();
    } else {
      alert(result.message || 'Có lỗi xảy ra');
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra khi cập nhật trạng thái');
  }
}

// ===== UPDATE PAYMENT STATUS =====
async function updatePaymentStatus(maDonHang, trangThaiThanhToan) {
  try {
    const response = await fetch(`/quanlydonhang/api/orders/${maDonHang}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ trangThaiThanhToan })
    });

    const result = await response.json();

    if (result.success) {
      alert('Cập nhật trạng thái thanh toán thành công!');
      window.location.reload();
    } else {
      alert(result.message || 'Có lỗi xảy ra');
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra khi cập nhật trạng thái thanh toán');
  }
}

// ===== UPDATE DELIVERY STATUS =====
async function updateDeliveryStatus(maDonHang, trangThaiGiaoHang) {
  try {
    const response = await fetch(`/quanlydonhang/api/orders/${maDonHang}/delivery`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ trangThaiGiaoHang })
    });

    const result = await response.json();

    if (result.success) {
      alert('Cập nhật trạng thái giao hàng thành công!');
      window.location.reload();
    } else {
      alert(result.message || 'Có lỗi xảy ra');
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra khi cập nhật trạng thái giao hàng');
  }
}
function appendOrderToTable(order) {
  const tableBody = document.getElementById('orderTableBody');
  if (tableBody) tableBody.insertAdjacentHTML('afterbegin', createOrderRow(order));
}
