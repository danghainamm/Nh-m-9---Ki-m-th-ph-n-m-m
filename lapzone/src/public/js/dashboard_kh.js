// Hàm hiển thị prompt hỏi số lượng và gửi yêu cầu AJAX
function promptForQuantity(event, maSanPham) {
  event.preventDefault(); // Ngăn chặn hành động mặc định của thẻ <a>

  //  Hiển thị hộp thoại nhập số lượng
  let soLuongInput = prompt("Nhập số lượng bạn muốn thêm:", "1");

  // Xử lý đầu vào
  if (soLuongInput === null) {
    return;
  }

  let soLuong = Number(soLuongInput.trim());
  // Kiểm tra tính hợp lệ của số lượng
  if (!Number.isSafeInteger(soLuong) || soLuong <= 0) {
    alert("Số lượng không hợp lệ. Vui lòng nhập một số nguyên dương.");
    return;
  }
  // Gửi yêu cầu AJAX
  const url = `/cart/add?maSanPham=${maSanPham}&soLuong=${soLuong}`;

  fetch('/cart/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ maSanPham, soLuong }) })
    .then((response) => {
      // Xử lý response status
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(
            errorData.message || "Server returned error: " + response.status
          );
        });
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        // Hiển thị thông báo thành công
        showSimpleNotification(`Đã thêm ${soLuong} sản phẩm vào giỏ!`);
      } else {
        alert(`Lỗi: ${data.message}`);
        if (data.message.includes("đăng nhập")) {
        }
      }
    })
    .catch((error) => {
      console.error("AJAX Error:", error);
      alert(error.message || "Có sự cố xảy ra. Vui lòng thử lại sau.");
    });
}

// Hàm hiển thị thông báo TOAST
function showSimpleNotification(message = "Đã thêm vào giỏ hàng!") {
  const old = document.querySelector(".cart-notification");
  if (old) old.remove();

  const notification = document.createElement("div");
  notification.className = "cart-notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 500);
  }, 1200);
}


const nguoidung = document.querySelector(".nguoidung");
const list = document.querySelector(".list");

if (nguoidung && list) nguoidung.addEventListener("click", (e) => {
  e.stopPropagation(); // tránh click lan ra body
  if (list.style.display === "block") {
    list.style.display = "none";
  } else {
    list.style.display = "block";
  }
});

// Ẩn khi click ra ngoài
document.body.addEventListener("click", () => {
  if (list) list.style.display = "none";
});

document.addEventListener("DOMContentLoaded", function() {
    const products = document.querySelectorAll('.thesp');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const countDisplay = document.getElementById('count-remaining');
    if (!loadMoreBtn || !countDisplay) return;

    let itemsToShow = 10; // Mặc định hiện 2 hàng (5 sp/hàng)
    const step = 10;      // Tải thêm 2 hàng mỗi lần click

    function updateVisibility() {
        products.forEach((product, index) => {
            product.style.display = (index < itemsToShow) ? 'block' : 'none';
        });

        let remaining = products.length - itemsToShow;
        if (remaining > 0) {
            countDisplay.innerText = remaining;
            loadMoreBtn.parentElement.style.display = 'block';
        } else {
            loadMoreBtn.parentElement.style.display = 'none';
        }
    }

    loadMoreBtn.addEventListener('click', function() {
        itemsToShow += step;
        updateVisibility();
    });

    updateVisibility();
});
