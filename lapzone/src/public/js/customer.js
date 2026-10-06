document.addEventListener('DOMContentLoaded', function() {
    const filterSelect = document.querySelector('.status-filter');
    const tableRows = document.querySelectorAll('.custom-table tbody tr');//lấy ds hàng trong bảng trừ thead

    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const selectedStatus = this.value; 

            tableRows.forEach(row => {
                const badge = row.querySelector('.badge');
                if (!badge) return;

                if (selectedStatus === 'all') {//hiện tất cả
                    row.style.display = ''; 
                } 
                else if (selectedStatus === 'active') {//hiện tk hd
                    if (badge.classList.contains('active')) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                } 
                else if (selectedStatus === 'locked') {//hiện tk khóa
                    if (badge.classList.contains('locked')) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        });
    }
});