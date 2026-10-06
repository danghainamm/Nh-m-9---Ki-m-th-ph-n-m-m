document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("modal-update-profile");
    const btnOpen = document.querySelector(".lpz-btn-update");    
    const btnClose = document.querySelector(".close-modal");      
    const btnReset = document.getElementById("btn-reset-profile");
    const form = document.querySelector(".modal-form");           

    function clearErrors() {
        document.querySelectorAll(".error-message").forEach(el => el.textContent = "");
    }

    if (btnOpen) {
        btnOpen.addEventListener("click", function () {
            modal.style.display = "flex";
        });
    }

    function closeModal() {
        modal.style.display = "none";
        if (form) {
            form.reset();
        }
        clearErrors();
    }

    if (btnClose) {
        btnClose.addEventListener("click", closeModal); 
    }

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    if (btnReset) {
        btnReset.addEventListener("click", function () {
            if (form) {
                form.reset();
                clearErrors();
            }
        });
    }

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault(); 
            
            let isValid = true;
            clearErrors(); 

            const hoTen = document.querySelector('input[name="hoTen"]').value.trim();
            const soDienThoai = document.querySelector('input[name="soDienThoai"]').value.trim();
            const email = document.querySelector('input[name="email"]').value.trim();
            const diaChi = document.querySelector('input[name="diaChiNhanHang"]').value.trim();

            if (hoTen === "") {
                document.getElementById("error-hoTen").textContent = "Vui lòng nhập họ và tên.";
                isValid = false;
            } else {
                const nameRegex = /^[\p{L}\s]+$/u;
                if (!nameRegex.test(hoTen)) {
                    document.getElementById("error-hoTen").textContent = "Họ tên không được chứa số hoặc ký tự đặc biệt.";
                    isValid = false;
                }
            }

            if (soDienThoai === "") {
                document.getElementById("error-soDienThoai").textContent = "Vui lòng nhập số điện thoại.";
                isValid = false;
            } else {
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(soDienThoai)) {
                    document.getElementById("error-soDienThoai").textContent = "Số điện thoại phải bao gồm chính xác 10 chữ số.";
                    isValid = false;
                }
            }

            if (email === "") {
                document.getElementById("error-email").textContent = "Vui lòng nhập email.";
                isValid = false;
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    document.getElementById("error-email").textContent = "Định dạng email không hợp lệ.";
                    isValid = false;
                }
            }

            if (diaChi === "") {
                document.getElementById("error-diaChi").textContent = "Vui lòng nhập địa chỉ giao hàng.";
                isValid = false;
            }

            if (isValid) {
                form.submit();
            }
        });
        
        // xóa dòng lỗi màu đỏ khi gõ lại vào ô
        const inputs = form.querySelectorAll(".lpz-input");
        inputs.forEach(input => {
            input.addEventListener("input", function() {
                const errorSpan = this.nextElementSibling;
                if (errorSpan && errorSpan.classList.contains("error-message")) {
                    errorSpan.textContent = "";
                }
            });
        });
    }
});