document.querySelectorAll('a[href*="/quanlytaikhoan/xoa/"], a[href*="/quanlytaikhoan/trangthai/"]').forEach(link => {
  link.addEventListener('click', async event => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    try {
      const response = await fetch(link.href, { method: 'POST' });
      if (!response.ok) return alert(await response.text());
      location.reload();
    } catch { alert('Không thể cập nhật tài khoản.'); }
  });
});
