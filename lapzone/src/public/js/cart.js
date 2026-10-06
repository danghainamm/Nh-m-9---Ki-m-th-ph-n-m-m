// 1. CẬP NHẬT TỔNG TIỀN VÀ TRẠNG THÁI NÚT THANH TOÁN
function updateTotal() {
    let total = 0;
    let hasChecked = false;

    // Lặp qua từng card sản phẩm
    document.querySelectorAll(".cart-item-card").forEach((card) => {
        const checkbox = card.querySelector(".select-checkbox");
        if (!checkbox) return;

        // Lấy giá từ data-price và số lượng từ input
        const price = parseFloat(checkbox.getAttribute("data-price")) || 0;
        const quantityInput = card.querySelector(".quantity-control input");
        const quantity = parseInt(quantityInput.value) || 1;

        if (checkbox.checked) {
            total += price * quantity;
            hasChecked = true;
        }
    });

    // Cập nhật hiển thị tổng tiền trên thanh sticky bar
    const totalPriceElement = document.getElementById("totalPrice");
    if (totalPriceElement) {
        totalPriceElement.textContent = total.toLocaleString("vi-VN") + "đ";
    }

    // Bật/Tắt nút "Mua ngay" (Nếu không chọn gì thì mờ đi)
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.disabled = !hasChecked;
        checkoutBtn.style.opacity = hasChecked ? "1" : "0.5";
    }
}

// 2. LẮNG NGHE SỰ KIỆN THAY ĐỔI
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.btn-delete').forEach(link => link.addEventListener('click', async event => {
        if (event.defaultPrevented) return;
        event.preventDefault();
        try {
            const id = new URL(link.href).searchParams.get('maSanPham');
            const response = await fetch('/cart/remove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ maSanPham: id }) });
            const result = await response.json();
            if (!result.success) return alert(result.message);
            location.reload();
        } catch { alert('Không thể xóa sản phẩm.'); }
    }));
    // Sự kiện khi tích chọn từng sản phẩm
    document.querySelectorAll(".select-checkbox").forEach((cb) => {
        cb.addEventListener("change", updateTotal);
    });

    // Sự kiện Chọn tất cả
    const selectAllCb = document.getElementById("selectAll");
    if (selectAllCb) {
        selectAllCb.addEventListener("change", function () {
            const isChecked = this.checked;
            document.querySelectorAll(".select-checkbox").forEach((cb) => {
                cb.checked = isChecked;
            });
            updateTotal();
        });
    }

    // Chạy tính toán lần đầu khi load trang
    updateTotal();
});

// 3. HÀM XỬ LÝ THANH TOÁN (Lấy dữ liệu từ Card)
function proceedToCheckout() {
    const checkedBoxes = document.querySelectorAll('.select-checkbox:checked');

    if (checkedBoxes.length === 0) {
        alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
        return;
    }

    const selectedItems = [];
    checkedBoxes.forEach(checkbox => {
        try {
            // Lấy dữ liệu sản phẩm được nhúng trong thuộc tính data-product
            const productData = JSON.parse(checkbox.getAttribute('data-product'));

            // Cập nhật số lượng mới nhất từ input vào object trước khi gửi đi
            const card = checkbox.closest('.cart-item-card');
            const currentQty = card.querySelector('.quantity-control input').value;
            productData.soLuong = parseInt(currentQty);

            selectedItems.push(productData);
        } catch (e) {
            console.error('Lỗi lấy dữ liệu sản phẩm:', e);
        }
    });

    // Lưu vào sessionStorage để trang Checkout sử dụng
    sessionStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));

    // Chuyển hướng
    window.location.href = '/order/checkout';
}
