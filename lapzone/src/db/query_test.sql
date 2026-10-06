
SELECT * FROM khachhang


select * from khachhang WHERE `tenDangNhap` = 'tuando'


SELECT * from quantrivien

select * from quantrivien WHERE quantrivien.`tenDangNhap` ="admin"

SELECT * FROM giohang WHERE maKhachHang = 'KH001';

select * from quantrivien WHERE quantrivien.`tenDangNhap` ="admin"

select * FROM sanpham where maSanPham ='SPA02'

select * FROM danhmuc



SELECT * FROM SanPham sp INNER JOIN DanhMuc dm ON sp.maDanhMuc = dm.maDanhMuc;


SELECT *, dm.tenDanhMuc AS tenDM
      FROM sanPham sp
      INNER JOIN DanhMuc dm ON sp.maDanhMuc = dm.maDanhMuc
      INNER JOIN thongsokythuat tskt ON tskt.maSanPham = sp.maSanPham
      WHERE sp.maSanPham = 'SPA02'



SELECT 
        sp.tenSanPham,
        sp.thuonghieu,
        sp.tinhTrang,
        sp.soLuongTon,
        sp.giaBan,
        sp.moTa,
        sp.anhMinhHoaSP,
        tskt.*

      FROM sanPham sp
      INNER JOIN DanhMuc dm ON sp.maDanhMuc = dm.maDanhMuc
      INNER JOIN thongSoKyThuat tskt ON tskt.maSanPham = sp.maSanPham
      WHERE sp.maSanPham ='SPA01'



SELECT DISTINCT thuonghieu FROM sanpham 

SELECT DISTINCT `doPhanGiaiMH` FROM thongSoKyThuat

SELECT 
  sp.*, 
  dm.tenDanhMuc AS tenDM
FROM sanPham sp
INNER JOIN DanhMuc dm ON sp.maDanhMuc = dm.maDanhMuc
WHERE sp.maDanhMuc = "DM03"