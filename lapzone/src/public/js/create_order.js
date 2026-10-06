const createOrderForm = document.getElementById('createOrderForm');
const productSelect = document.getElementById('maSanPham');
const quantityInput = document.getElementById('soLuong');
function updateOrderTotal() {
  const option = productSelect.selectedOptions[0];
  quantityInput.max = option.dataset.stock || 100000;
  const total = Number(option.dataset.price || 0) * Number(quantityInput.value || 0);
  document.getElementById('orderTotal').textContent = total.toLocaleString('vi-VN') + 'đ';
}
productSelect.addEventListener('change', updateOrderTotal);
quantityInput.addEventListener('input', updateOrderTotal);
createOrderForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = createOrderForm.querySelector('button[type="submit"]');
  const message = document.getElementById('formMessage');
  button.disabled = true;
  message.textContent = 'Đang tạo đơn hàng…';
  try {
    const body = Object.fromEntries(new FormData(createOrderForm));
    body.soLuong = Number(body.soLuong);
    const response = await fetch(createOrderForm.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Không thể tạo đơn hàng.');
    window.location.href = '/quanlydonhang/chitiet/' + encodeURIComponent(result.maDonHang);
  } catch (error) {
    message.textContent = error.message;
    button.disabled = false;
  }
});
