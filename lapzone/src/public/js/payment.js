// Hàm thay đổi số lượng (dùng cho order.ejs - đặt hàng đơn)
function changeQuantity(change) {
  const quantityInput = document.getElementById('quantity');
  if (!quantityInput) return;
  const hiddenQuantity = document.getElementById('hiddenSoLuong');
  const hiddenTotal = document.getElementById('hiddenTongGiaTri');
  const totalDisplay = document.getElementById('tongTien');
  const btnInc = document.getElementById('qtyIncrease');
  const btnDec = document.getElementById('qtyDecrease');

  const maxStock = Number.isFinite(Number(window.soLuongTon)) ? Number(window.soLuongTon) : 0;

  let newQuantity = parseInt(quantityInput.value) + change;
  if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;
  if (newQuantity > maxStock) {
    newQuantity = maxStock;
    alert('Số lượng không thể vượt quá tồn kho: ' + maxStock);
  }

  quantityInput.value = newQuantity;
  hiddenQuantity.value = newQuantity;

  const newTotal = window.giaBanSanPham * newQuantity;
  hiddenTotal.value = newTotal;
  totalDisplay.textContent = newTotal.toLocaleString() + ' VND';

  if (btnInc) btnInc.disabled = newQuantity >= maxStock;
  if (btnDec) btnDec.disabled = newQuantity <= 1;
}

// Toggle using account info to prefill buyer fields
function toggleAccountInfo() {
  const use = document.getElementById('useAccountInfo');
  const ho = document.getElementById('hoTenNguoiNhan');
  const sdt = document.getElementById('soDienThoaiNguoiNhan');
  const diachi = document.getElementById('diaChiNhanHang');
  const accountSelector = document.getElementById('accountSelector');
  const selectEl = document.getElementById('selectDiaChi');
  if (!use || !ho || !sdt || !diachi) return;

  if (use.checked) {
    // If there is a saved address select, prefer filling from the selected address
    if (selectEl && selectEl.options && selectEl.options.length && selectEl.value) {
      fillAddress();
    } else {
      ho.value = window.khachHang?.hoTen || ho.value || '';
      sdt.value = window.khachHang?.soDienThoai || sdt.value || '';
      diachi.value = window.khachHang?.diaChi || diachi.value || '';
      // set hidden maDiaChiChon empty since we used account fields
      const maDiaChiInput = document.getElementById('maDiaChiChon');
      if (maDiaChiInput) maDiaChiInput.value = '';
    }

    ho.readOnly = sdt.readOnly = diachi.readOnly = true;
    ho.classList.add('readonly'); sdt.classList.add('readonly'); diachi.classList.add('readonly');
    if (accountSelector) { accountSelector.classList.add('selected'); accountSelector.setAttribute('aria-pressed','true'); }
  } else {
    ho.readOnly = sdt.readOnly = diachi.readOnly = false;
    ho.classList.remove('readonly'); sdt.classList.remove('readonly'); diachi.classList.remove('readonly');
    if (accountSelector) { accountSelector.classList.remove('selected'); accountSelector.setAttribute('aria-pressed','false'); }
  }
}

// Hàm điền thông tin địa chỉ đã lưu (dùng cho checkout.ejs)
function fillAddress() {
  const selectEl = document.getElementById('selectDiaChi');
  if (!selectEl) return; // Nếu không có element này thì bỏ qua

  const selectedOption = selectEl.options[selectEl.selectedIndex];

  if (selectedOption && selectedOption.value) {
    const maInput = document.getElementById('maDiaChiChon');
    if (maInput) maInput.value = selectedOption.value;
    const ho = document.getElementById('hoTenNguoiNhan');
    const sdt = document.getElementById('soDienThoaiNguoiNhan');
    const diachi = document.getElementById('diaChiNhanHang');
    if (ho) ho.value = selectedOption.dataset.hoten || (window.khachHang?.hoTen || '');
    if (sdt) sdt.value = selectedOption.dataset.sdt || (window.khachHang?.soDienThoai || '');
    if (diachi) diachi.value = selectedOption.dataset.diachi || (window.khachHang?.diaChi || '');
  } else {
    const maInput = document.getElementById('maDiaChiChon');
    if (maInput) maInput.value = '';
  }
}

// Xử lý submit form khi trang load xong
document.addEventListener('DOMContentLoaded', function() {
  const orderForm = document.getElementById('orderForm');

  if (!orderForm) return;

  // Initialize quantity and buttons (for single-product order page)
  const qtyInput = document.getElementById('quantity');
  if (qtyInput) {
    const maxStock = parseInt(window.soLuongTon) || Infinity;
    if (maxStock < 1) {
      qtyInput.value = 0;
      const hiddenQuantity = document.getElementById('hiddenSoLuong');
      const hiddenTotal = document.getElementById('hiddenTongGiaTri');
      const totalDisplay = document.getElementById('tongTien');
      if (hiddenQuantity) hiddenQuantity.value = 0;
      if (hiddenTotal) hiddenTotal.value = 0;
      if (totalDisplay) totalDisplay.textContent = '0 VND';
      const btnInc = document.getElementById('qtyIncrease');
      const btnDec = document.getElementById('qtyDecrease');
      if (btnInc) btnInc.disabled = true;
      if (btnDec) btnDec.disabled = true;
      const submitBtn = document.getElementById('submitBtn');
      if (submitBtn) submitBtn.disabled = true;
      const stockInfo = document.getElementById('stockInfo');
      if (stockInfo) stockInfo.textContent = 'Hết hàng';
    } else {
      changeQuantity(0);
    }
  }

  // Setup useAccountInfo checkbox behavior
  const useCheckbox = document.getElementById('useAccountInfo');
  if (useCheckbox) {
    useCheckbox.addEventListener('change', toggleAccountInfo);
    toggleAccountInfo();

    // Make the whole selector clickable and keyboard accessible
    const accountSelector = document.getElementById('accountSelector');
    if (accountSelector) {
      accountSelector.addEventListener('click', function() {
        useCheckbox.checked = !useCheckbox.checked;
        useCheckbox.dispatchEvent(new Event('change'));
      });
      accountSelector.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          accountSelector.click();
        }
      });
      // set initial visual state
      accountSelector.classList.toggle('selected', useCheckbox.checked);
      accountSelector.setAttribute('aria-pressed', useCheckbox.checked);
    }

        // If there is a select for saved addresses, wire up change handler and pre-fill when checked
        const selectEl = document.getElementById('selectDiaChi');
        if (selectEl) {
          selectEl.addEventListener('change', fillAddress);
          // If the form is set to use account info initially, fill from selected address
          if (useCheckbox.checked) {
            fillAddress();
          }
        }

        // If the user manually edits any recipient input, clear the selected address
        const hoInput = document.getElementById('hoTenNguoiNhan');
        const sdtInput = document.getElementById('soDienThoaiNguoiNhan');
        const diachiInput = document.getElementById('diaChiNhanHang');
        const maDiaChiInput = document.getElementById('maDiaChiChon');
        [hoInput, sdtInput, diachiInput].forEach(el => {
          if (!el) return;
          el.addEventListener('input', function() {
            // If there was a selected saved address, clear it so server treats input as manual
            if (maDiaChiInput && maDiaChiInput.value) {
              maDiaChiInput.value = '';
            }
            // Also uncheck useAccountInfo to make fields editable and indicate manual entry
            if (useCheckbox && useCheckbox.checked) {
              useCheckbox.checked = false;
              useCheckbox.dispatchEvent(new Event('change'));
            }
          });
        });
      }

      // Attach submit handler for the order form (single-product or checkout)
      orderForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn ? submitBtn.textContent : '';

        // Client-side validation
        const ho = document.getElementById('hoTenNguoiNhan');
        const sdt = document.getElementById('soDienThoaiNguoiNhan');
        const diachi = document.getElementById('diaChiNhanHang');
        if (!ho || !sdt || !diachi || !ho.value.trim() || !sdt.value.trim() || !diachi.value.trim()) {
          alert('Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng.');
          if (ho && !ho.value.trim()) ho.focus();
          else if (sdt && !sdt.value.trim()) sdt.focus();
          else if (diachi && !diachi.value.trim()) diachi.focus();
          return;
        }

        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang xử lý...'; }

        try {
          const formData = new FormData(this);
          const data = Object.fromEntries(formData);

          const isCheckout = this.action.includes('/checkout');
          const endpoint = isCheckout ? '/order/checkout' : '/order/dat-hang';

          // If checkout, add cartItems from window.cartItems
          if (isCheckout && window.cartItems) {
            data.cartItems = window.cartItems;
          }

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          const result = await response.json();

          if (result.success) {
            if ((isCheckout || endpoint === '/order/dat-hang') && result.needQRPayment && result.qrPaymentUrl) {
              window.location.href = result.qrPaymentUrl;
            } else {
              alert('Đặt hàng thành công!\nMã đơn hàng: ' + (result.order ? result.order.maDonHang : ''));
              window.location.href = '/kh/trangchu';
            }
          } else {
            alert('Lỗi: ' + result.message);
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
          }
        } catch (error) {
          console.error('Lỗi:', error);
          alert('Có lỗi xảy ra: ' + error.message);
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        }
      });

    });
