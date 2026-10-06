/*  ĐÁNH GIÁ SẢN PHẨM */

document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.querySelector(".write-btn");
  const overlay = document.querySelector(".review-form-overlay");
  const closeBtn = document.querySelector(".close-form");
  const submitBtn = document.getElementById("submitReviewBtn");
  const starSelect = document.getElementById("starSelect");
  const productId = document.getElementById("productId")?.value || null;

  let selectedStars = 5; // Mặc định 5 sao

  // LOAD ĐÁNH GIÁ KHI VÀO TRANG
  if (productId) {
    loadReviews(productId);
    loadReviewStats(productId);
  }

  // HÀM LOAD DANH SÁCH ĐÁNH GIÁ
  async function loadReviews(productId) {
    try {
      const res = await fetch(`/review/list/${productId}`);
      const data = await res.json();

      if (data.success && data.reviews.length > 0) {
        const container = document.querySelector(".reviews-container");
        const noReview = container?.querySelector(".no-review");

        if (noReview) {
          noReview.remove();
        }

        data.reviews.forEach((review) => {
          addReviewToUI(
            {
              name: review.tenKhachHang,
              star: review.soSao,
              content: review.noiDung,
              date: formatDate(review.ngayDanhGia),
            },
            false
          );
        });
      }
    } catch (err) {
      console.error("Lỗi load đánh giá:", err);
    }
  }

  //  HÀM LOAD THỐNG KÊ ĐÁNH GIÁ
  async function loadReviewStats(productId) {
    try {
      const res = await fetch(`/review/stats/${productId}`);
      const data = await res.json();

      if (data.success && data.stats) {
        const stats = data.stats;

        // Cập nhật điểm trung bình
        const avgScore = document.querySelector(".avg-score");
        if (avgScore) {
          const avgValue = parseFloat(stats.avgStar) || 0;
          avgScore.innerHTML = `${avgValue.toFixed(1)}<span>/5</span>`;
        }

        // Cập nhật số lượt đánh giá
        const count = document.querySelector(".count");
        if (count) {
          count.textContent = `${stats.totalReviews || 0} lượt đánh giá`;
        }

        // Cập nhật thanh progress
        const total = stats.totalReviews || 1;
        updateProgressBar(5, stats.star5, total);
        updateProgressBar(4, stats.star4, total);
        updateProgressBar(3, stats.star3, total);
        updateProgressBar(2, stats.star2, total);
        updateProgressBar(1, stats.star1, total);
      }
    } catch (err) {
      console.error("Lỗi load thống kê:", err);
    }
  }

  // HÀM CẬP NHẬT THANH PROGRESS
  function updateProgressBar(star, count, total) {
    const rows = document.querySelectorAll(".rating-row");
    const row = rows[5 - star];
    if (row) {
      const barFill = row.querySelector(".bar-fill");
      const countSpan = row.querySelector("span:last-child");

      const percent = (count / total) * 100;
      if (barFill) barFill.style.width = `${percent}%`;
      if (countSpan) countSpan.textContent = `${count} đánh giá`;
    }
  }

  // HÀM FORMAT NGÀY
  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // HÀM CẬP NHẬT HIỂN THỊ SAO
  function updateStarDisplay(stars) {
    if (!starSelect) return;

    starSelect.innerHTML = "";

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("span");
      star.textContent = "★";
      star.style.transition = "color 0.2s ease";
      star.style.cursor = "pointer";
      star.setAttribute("data-star", i);

      if (i <= stars) {
        star.style.color = "#ffc107";
      } else {
        star.style.color = "#ddd";
      }

      starSelect.appendChild(star);
    }
  }

  // KHỞI TẠO SAO
  if (starSelect) {
    updateStarDisplay(selectedStars);

    starSelect.addEventListener("click", (e) => {
      if (e.target.tagName === "SPAN" && e.target.hasAttribute("data-star")) {
        // Cập nhật selectedStars
        selectedStars = parseInt(e.target.getAttribute("data-star"));

        // Cập nhật hiển thị
        updateStarDisplay(selectedStars);

        console.log("⭐ Đã chọn", selectedStars, "sao");
      }
    });
  }

  // ========== MỞ FORM ==========
  if (openBtn && overlay) {
    openBtn.addEventListener("click", () => {
      overlay.classList.add("active");

      // Reset form
      if (document.getElementById("reviewContent")) {
        document.getElementById("reviewContent").value = "";
      }
      updateStarDisplay(selectedStars);
    });
  }

  // ========== ĐÓNG FORM ==========
  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("active");
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  }

  // ========== GỬI ĐÁNH GIÁ ==========
  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const content = document.getElementById("reviewContent")?.value.trim();

      console.log("📤 Gửi đánh giá:", {
        productId: productId,
        star: selectedStars,
        content: content,
      });

      // Validate
      if (!content) {
        alert("Vui lòng nhập nội dung đánh giá!");
        return;
      }

      //   if (content.length < 10) {
      //     alert("Nội dung đánh giá phải có ít nhất 10 ký tự!");
      //     return;
      //   }

      if (!productId) {
        alert("Không tìm thấy mã sản phẩm!");
        return;
      }

      // Disable button
      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Đang gửi...";

      try {
        // Gửi API
        const res = await fetch("/review/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: productId,
            star: selectedStars,
            content: content,
          }),
        });

        const data = await res.json();

        if (!data.success) {
          alert(data.message || "Không thể gửi đánh giá");
          return;
        }

        // Thêm đánh giá vào giao diện
        addReviewToUI(
          {
            name: data.userName || "Người dùng",
            star: selectedStars,
            content: content,
            date: "Vừa xong",
          },
          true
        );

        // Đóng form
        overlay.classList.remove("active");

        // Reset form
        document.getElementById("reviewContent").value = "";
        selectedStars = 5;
        updateStarDisplay(selectedStars);

        // Reload stats
        loadReviewStats(productId);

        // Thông báo
        alert("✅ Cảm ơn bạn đã đánh giá!");
      } catch (err) {
        console.error("Lỗi gửi đánh giá:", err);
        alert("❌ Không thể gửi đánh giá. Vui lòng thử lại!");
      } finally {
        // Enable lại button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // ========== HÀM THÊM ĐÁNH GIÁ VÀO GIAO DIỆN ==========
  function addReviewToUI(review, prepend = true) {
    const container = document.querySelector(".reviews-container");

    if (!container) return;

    // Xóa thông báo "Chưa có đánh giá" nếu có
    const noReview = container.querySelector(".no-review");
    if (noReview) {
      noReview.remove();
    }

    // Tạo phần tử đánh giá mới
    const reviewItem = document.createElement("div");
    reviewItem.className = "review-item";

    // Tạo sao đầy và sao rỗng
    const filledStars = "★".repeat(review.star);
    const emptyStars = "☆".repeat(5 - review.star);

    reviewItem.innerHTML = `
      <div class="review-header">
        <div>
          <div class="reviewer-name">${escapeHtml(review.name)}</div>
          <div class="review-date">${escapeHtml(review.date)}</div>
        </div>
        <div class="review-stars">${filledStars}${emptyStars}</div>
      </div>
      <div class="review-text">${escapeHtml(review.content)}</div>
    `;

    // Thêm vào đầu hoặc cuối danh sách
    if (prepend) {
      container.insertBefore(reviewItem, container.firstChild);
    } else {
      container.appendChild(reviewItem);
    }
  }

  // ========== HÀM ESCAPE HTML ==========
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // ========== XỬ LÝ BỘ LỌC SAO ==========
  const filterButtons = document.querySelectorAll(".filter-box .filter");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Bỏ active ở tất cả
      filterButtons.forEach((b) => b.classList.remove("active"));

      // Thêm active cho nút được click
      this.classList.add("active");

      const filterText = this.textContent.trim();
      const reviewItems = document.querySelectorAll(".review-item");

      reviewItems.forEach((item) => {
        if (filterText === "Tất cả") {
          item.style.display = "block";
        } else {
          const starCount =
            item.querySelector(".review-stars").textContent.split("★").length -
            1;
          const filterStar = parseInt(filterText);

          if (starCount === filterStar) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        }
      });
    });
  });
});
