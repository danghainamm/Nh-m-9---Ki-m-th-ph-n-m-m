
  let selectedFilters = {};

  // Xử lý click mở/đóng submenu
  document.querySelectorAll('.parent').forEach(parent => {
    const submenu = parent.querySelector('.submenu');
    const applyBtn = submenu.querySelector('.apply-submenu');
    
    parent.addEventListener('click', (e) => {
      if (e.target.closest('.submenu')) return; // Không đóng khi click bên trong submenu
      
      // Đóng các submenu khác đang mở
      document.querySelectorAll('.submenu').forEach(s => {
        if (s !== submenu) s.style.display = 'none';
      });

      submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
    });

    // Chọn Item trong submenu
    submenu.querySelectorAll('li[data-filter]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const filter = item.dataset.filter;
        const value = item.dataset.value;

        if (!selectedFilters[filter]) selectedFilters[filter] = [];

        if (selectedFilters[filter].includes(value)) {
          selectedFilters[filter] = selectedFilters[filter].filter(v => v !== value);
          item.classList.remove("selected");
        } else {
          selectedFilters[filter].push(value);
          item.classList.add("selected");
        }

        //bật tắt nút xem kết quả
        if (selectedFilters[filter].length > 0) {
          applyBtn.classList.add('active'); // Nút sáng đỏ, cho phép nhấn
        } else {
          applyBtn.classList.remove('active'); //khóa nhấn
        }

        // Tô màu nút bên ngoài nếu có chọn bên trong
        if (selectedFilters[filter].length > 0) {
          parent.classList.add('selected');
        } else {
          parent.classList.remove('selected');
        }
      });
    });

    // Nút Áp dụng (Chuyển hướng sang trang kết quả)
    submenu.querySelector('.apply-submenu')?.addEventListener('click', (e) => {
      e.stopPropagation();
      submitFilters();
    });

    submenu.querySelector('.close-submenu')?.addEventListener('click', (e) => {
      e.stopPropagation();
      submenu.style.display = 'none';
    });
  });

  function submitFilters() {
    const keywordInput = document.querySelector("input[name='keyword']");
    const keyword = keywordInput ? keywordInput.value : '';
    const params = new URLSearchParams({ keyword });

    // Đưa tất cả filter đã chọn vào URL
    Object.keys(selectedFilters).forEach(k => {
      selectedFilters[k].forEach(v => params.append(k, v));
    });

    const minP = document.getElementById("minPrice").value;
    const maxP = document.getElementById("maxPrice").value;
    if (minP) params.append("minPrice", minP);
    if (maxP) params.append("maxPrice", maxP);

    // CHUYỂN HƯỚNG SANG TRANG KẾT QUẢ TÌM KIẾM
    window.location.href = "/search/resultSearch?" + params.toString();
  }

  // Đóng khi click ra ngoài
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.parent')) {
      document.querySelectorAll('.submenu').forEach(s => s.style.display = 'none');
    }
  });

  // Tìm tất cả các hộp lọc giá (trong trường hợp bạn có nhiều nơi dùng)
  document.querySelectorAll('.price-filter-box').forEach(box => {
      const rangeInputs = box.querySelectorAll(".slider-container input[type='range']");
      const priceInputs = box.querySelectorAll(".price-input-container input[type='number']");
      const sliderTrack = box.querySelector(".slider-track");
      const applyBtn = box.querySelector('.apply-submenu');

      // Khoảng cách tối thiểu giữa 2 đầu (ví dụ: 1 triệu đồng)
      const priceGap = 1000000; 

      // Hàm cập nhật dải màu đỏ và vị trí
      const updateSliderUI = () => {
          let minVal = parseInt(rangeInputs[0].value);
          let maxVal = parseInt(rangeInputs[1].value);

          // Tính toán tỷ lệ phần trăm để vẽ dải màu đỏ
          const minPercent = (minVal / rangeInputs[0].max) * 100;
          const maxPercent = (maxVal / rangeInputs[1].max) * 100;

          sliderTrack.style.left = minPercent + "%";
          sliderTrack.style.right = (100 - maxPercent) + "%";

          // Đồng bộ số vào ô input
          priceInputs[0].value = minVal;
          priceInputs[1].value = maxVal;

          // Làm sáng nút "Xem kết quả"
          if (applyBtn) applyBtn.classList.add('active');
      };

      // 1. Xử lý khi kéo thanh gạt
      rangeInputs.forEach(input => {
          input.addEventListener("input", (e) => {
              let minVal = parseInt(rangeInputs[0].value);
              let maxVal = parseInt(rangeInputs[1].value);

              if (maxVal - minVal < priceGap) {
                  // Nếu 2 đầu quá gần nhau, chặn không cho kéo tiếp
                  if (e.target.className === "min-range") {
                      rangeInputs[0].value = maxVal - priceGap;
                  } else {
                      rangeInputs[1].value = minVal + priceGap;
                  }
              } else {
                  updateSliderUI();
              }
          });
      });

      // 2. Xử lý khi gõ số trực tiếp vào ô input
      priceInputs.forEach((input, index) => {
          input.addEventListener("change", (e) => {
              let minVal = parseInt(priceInputs[0].value);
              let maxVal = parseInt(priceInputs[1].value);
              const maxLimit = parseInt(rangeInputs[1].max);

              if (maxVal - minVal >= priceGap && maxVal <= maxLimit && minVal >= 0) {
                  if (index === 0) {
                      rangeInputs[0].value = minVal;
                  } else {
                      rangeInputs[1].value = maxVal;
                  }
                  updateSliderUI();
              } else {
                  // Nếu nhập sai quy tắc, trả về giá trị của thanh kéo
                  priceInputs[0].value = rangeInputs[0].value;
                  priceInputs[1].value = rangeInputs[1].value;
              }
          });
      });

      // Khởi tạo giao diện lần đầu khi load trang
      updateSliderUI();
  });