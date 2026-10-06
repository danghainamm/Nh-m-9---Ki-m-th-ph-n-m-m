const registerForm = document.getElementById('registerForm');
const usernameInput = document.getElementById('tenDangNhap');
const phoneInput = document.getElementById('soDienThoai');
const emailInput = document.getElementById('email');

const setErrorMessage = (inputId, message) => {
    const errorSpan = document.getElementById(`${inputId}-error`);
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.color = "red";
    }
};

// 1. Chỉ kiểm tra ĐỊNH DẠNG khi đang gõ (Không gọi DB ở đây)
usernameInput.addEventListener('input', function() {
    const regex = /^[a-zA-Z0-9]+$/;
    if (this.value.trim().length < 6 || !regex.test(this.value.trim())) {
        setErrorMessage('username', "Tên đăng nhập >= 6 ký tự, không chứa ký tự đặc biệt.");
    } else {
        setErrorMessage('username', ""); // Xóa thông báo nếu định dạng đúng
    }
});

phoneInput.addEventListener('input', function() {
    if (!/^[0-9]{10}$/.test(this.value.trim())) {
        setErrorMessage('phone', "Số điện thoại phải đúng 10 chữ số.");
    } else {
        setErrorMessage('phone', "");
    }
});

emailInput.addEventListener('input', function() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value.trim())) {
        setErrorMessage('email', "Email không đúng định dạng.");
    } else {
        setErrorMessage('email', "");
    }
});

// 2. KIỂM TRA TỒN TẠI TRONG DB KHI NHẤN NÚT HOÀN TẤT
registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const pass1 = document.getElementById('matKhau').value;
    const pass2 = document.getElementById('matKhau2').value;

    // --- PHẦN KIỂM TRA LẠI INPUT (QUAN TRỌNG) ---
    let clientError = false;

    // 1. Kiểm tra tên đăng nhập (6 ký tự, không ký tự đặc biệt)
    if (username.length < 6 || !/^[a-zA-Z0-9]+$/.test(username)) {
        setErrorMessage('username', "Tên đăng nhập không hợp lệ.");
        clientError = true;
    }

    // 2. Kiểm tra số điện thoại (10 số)
    if (!/^[0-9]{10}$/.test(phone)) {
        setErrorMessage('phone', "Số điện thoại phải đúng 10 chữ số.");
        clientError = true;
    }

    // 3. Kiểm tra email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrorMessage('email', "Email không đúng định dạng.");
        clientError = true;
    }

    // 4. Kiểm tra mật khẩu (độ dài & trùng khớp)
    if (pass1.length < 8) {
        alert("Mật khẩu phải tối thiểu 8 ký tự!");
        clientError = true;
    } else if (pass1 !== pass2) {
        alert("Mật khẩu nhập lại không khớp!");
        clientError = true;
    }

    // Nếu có lỗi định dạng thì dừng luôn, không gọi API làm gì cho tốn tài nguyên
    if (clientError) return;

    try {
        // B. Gọi đồng thời các API (Lúc này Server đã có route nên sẽ không lỗi <!DOCTYPE nữa)
        const [resUser, resPhone, resEmail] = await Promise.all([
            fetch(`/register/check-username?username=${encodeURIComponent(username)}`).then(r => r.json()),
            fetch(`/register/check-phone?phone=${encodeURIComponent(phone)}`).then(r => r.json()),
            fetch(`/register/check-email?email=${encodeURIComponent(email)}`).then(r => r.json())
        ]);

        let hasError = false;

        if (resUser.exists) {
            setErrorMessage('username', "Tên đăng nhập này đã tồn tại!");
            hasError = true;
        }
        if (resPhone.exists) {
            setErrorMessage('phone', "Số điện thoại này đã được đăng ký!");
            hasError = true;
        }
        if (resEmail.exists) {
            setErrorMessage('email', "Email này đã được sử dụng!");
            hasError = true;
        }

        if (!hasError) {
            registerForm.submit();
        }

    } catch (error) {
        console.error("Lỗi kiểm tra:", error);
        alert("Không thể kết nối đến máy chủ để kiểm tra thông tin.");
    }
});
