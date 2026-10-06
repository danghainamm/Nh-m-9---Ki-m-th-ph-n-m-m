// public/js/kho.js

// Hiển thị thông báo cho chức năng thêm mới (sẽ chuyển đến trang quản lý sản phẩm)
function showAddProductInfo() {
    if (confirm('Chức năng thêm sản phẩm mới nằm trong mục "Quản lý sản phẩm".\n\nBạn có muốn chuyển đến trang Quản lý sản phẩm không?')) {
      window.location.href = '/quanlysanpham';
    }
  }

  // Mở modal sửa sản phẩm
  function openEditModal(maSP, tinhTrang, soLuongTon) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');

    form.action = `/quanlykho/update/${maSP}`;

    // Điền dữ liệu vào form
    document.getElementById('maSP').value = maSP;
    document.getElementById('tinhTrang').value = tinhTrang;
    document.getElementById('soLuongTon').value = soLuongTon;

    modal.style.display = 'block';
  }

  // Đóng modal sửa
  function closeModal() {
    document.getElementById('productModal').style.display = 'none';
  }

  // Nhập hàng nhanh
  function quickImport(maSP) {
    document.getElementById('importMaSP').value = maSP;
    document.getElementById('importSoLuong').value = 1;
    document.getElementById('importStockModal').style.display = 'block';
  }

  // Đóng modal nhập hàng
  function closeImportStockModal() {
    document.getElementById('importStockModal').style.display = 'none';
  }

  // Submit nhập hàng
  async function submitImport() {
    const maSP = document.getElementById('importMaSP').value;
    const soLuong = Number(document.getElementById('importSoLuong').value);

    if (!Number.isSafeInteger(soLuong) || soLuong <= 0) {
      alert('Vui lòng nhập số lượng hợp lệ!');
      return;
    }

    try {
      const response = await fetch('/quanlykho/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maSP, soLuong })
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        closeImportStockModal();
        location.reload();
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Đã xảy ra lỗi khi nhập hàng!');
    }
  }

  // Xuất hàng nhanh
  function quickExport(maSP, currentStock) {
    document.getElementById('exportMaSP').value = maSP;
    document.getElementById('exportCurrentStock').value = currentStock;
    document.getElementById('exportSoLuong').value = 1;
    document.getElementById('exportSoLuong').max = currentStock;
    document.getElementById('exportStockModal').style.display = 'block';
  }

  // Đóng modal xuất hàng
  function closeExportStockModal() {
    document.getElementById('exportStockModal').style.display = 'none';
  }

  // Submit xuất hàng
  async function submitExport() {
    const maSP = document.getElementById('exportMaSP').value;
    const soLuong = Number(document.getElementById('exportSoLuong').value);
    const currentStock = parseInt(document.getElementById('exportCurrentStock').value);

    if (!Number.isSafeInteger(soLuong) || soLuong <= 0) {
      alert('Vui lòng nhập số lượng hợp lệ!');
      return;
    }

    if (soLuong > currentStock) {
      alert(`Số lượng xuất không được vượt quá số lượng tồn kho (${currentStock})!`);
      return;
    }

    try {
      const response = await fetch('/quanlykho/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maSP, soLuong })
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        closeExportStockModal();
        location.reload();
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Đã xảy ra lỗi khi xuất hàng!');
    }
  }

  // Mở modal import file
  function openImportModal() {
    document.getElementById('importModal').style.display = 'block';
  }

  // Đóng modal import file
  function closeImportModal() {
    document.getElementById('importModal').style.display = 'none';
    document.getElementById('importFile').value = '';
  }

  // Xử lý import file
  function handleImport() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];

    if (!file) {
      alert('Vui lòng chọn file để import!');
      return;
    }

    // Kiểm tra định dạng file
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
      alert('Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV!');
      return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Xử lý dữ liệu import
        processImportData(jsonData);

      } catch (error) {
        console.error('Lỗi đọc file:', error);
        alert('Lỗi khi đọc file. Vui lòng kiểm tra định dạng file!');
      }
    };

    reader.readAsArrayBuffer(file);
  }

  // Xử lý dữ liệu sau khi import
  async function processImportData(data) {

    // Validate dữ liệu
    const validData = data.filter(row => {
      return row['Mã sản phẩm'] || row['maSanPham'];
    });

    if (validData.length === 0) {
      alert('Không có dữ liệu hợp lệ để import!');
      return;
    }

    const items = data.map(row => {
      const stock = row['Tồn kho'] ?? row.soLuongTon;
      return { maSP: String(row['Mã sản phẩm'] ?? row.maSanPham ?? '').trim(), soLuongTon: stock === undefined || stock === '' ? null : Number(stock) };
    });
    try {
      const response = await fetch('/quanlykho/import-file', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) });
      const result = await response.json();
      alert(result.message);
      if (result.success) location.reload();
    } catch { alert('Không thể cập nhật tồn kho từ file.'); }
  }

  // Xuất dữ liệu ra file Excel
  function exportToFile() {
    // Lấy dữ liệu từ bảng
    const table = document.querySelector('.data-table');
    const rows = table.querySelectorAll('tbody tr');

    if (rows.length === 0 || rows[0].querySelector('.no-data')) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const data = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length > 0 && !row.hidden) {
        data.push({
          'Mã sản phẩm': cells[0].textContent.trim(),
          'Tên sản phẩm': cells[1].textContent.trim(),
          'Model': cells[2].textContent.trim(),
          'Giá nhập': cells[3].textContent.trim(),
          'Giá bán': cells[4].textContent.trim(),
          'Trạng thái': cells[5].textContent.trim(),
          'Tồn kho': Number(cells[6].textContent.trim()),
          'Đã bán': Number(cells[7].textContent.trim()),
          'Ngày bán đầu': cells[8].textContent.trim(),
          'Tổng giá trị': cells[9].textContent.trim()
        });
      }
    });

    // Tạo workbook và worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kho hàng');

    // Auto-size columns
    const maxWidth = data.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
    worksheet['!cols'] = Array(maxWidth).fill({ wch: 15 });

    // Xuất file
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `kho_hang_${date}.xlsx`);
  }

  // Toggle filters (có thể mở rộng sau)
  let stockFilter = 0;
  function toggleFilters() {
    stockFilter = (stockFilter + 1) % 3;
    const labels = ['Tất cả tồn kho', 'Sắp hết (<10)', 'Hết hàng'];
    document.querySelector('.filter-icon').textContent = labels[stockFilter];
    document.querySelectorAll('.data-table tbody tr').forEach(row => {
      if (!row.hasAttribute('data-stock')) return;
      const stock = Number(row.dataset.stock);
      row.hidden = stockFilter === 1 ? stock >= 10 : stockFilter === 2 ? stock !== 0 : false;
    });
  }

  // Đóng modal khi click outside
  window.onclick = function(event) {
    const productModal = document.getElementById('productModal');
    const importStockModal = document.getElementById('importStockModal');
    const exportStockModal = document.getElementById('exportStockModal');
    const importModal = document.getElementById('importModal');

    if (event.target === productModal) {
      closeModal();
    }
    if (event.target === importStockModal) {
      closeImportStockModal();
    }
    if (event.target === exportStockModal) {
      closeExportStockModal();
    }
    if (event.target === importModal) {
      closeImportModal();
    }
  }

  // Load thư viện XLSX từ CDN
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  document.head.appendChild(script);

  // Tự động ẩn thông báo sau 5 giây
  document.addEventListener('DOMContentLoaded', function() {
    const alert = document.querySelector('.alert');
    if (alert) {
      setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.5s';
        setTimeout(() => alert.remove(), 500);
      }, 5000);
    }
  });
