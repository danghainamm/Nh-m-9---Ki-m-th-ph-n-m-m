-- Giữ nguyên database và dữ liệu đã có khi chạy lại.
CREATE DATABASE IF NOT EXISTS lapzone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lapzone;

-- ========================
-- BẢNG KHÁCH HÀNG
-- ========================
CREATE TABLE IF NOT EXISTS KhachHang (
    maKhachHang VARCHAR(255) PRIMARY KEY,
    hoTen VARCHAR(255),
    tenDangNhap VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    matKhau VARCHAR(255),
    soDienThoai VARCHAR(255) UNIQUE,
    trangThai VARCHAR(255)
);

-- ========================
-- BẢNG QUẢN TRỊ VIÊN
-- ========================
CREATE TABLE IF NOT EXISTS QuanTriVien (
    maQuanTriVien VARCHAR(255) PRIMARY KEY,
    hoTen VARCHAR(255),
    tenDangNhap VARCHAR(255) UNIQUE,
    matKhau VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    soDienThoai VARCHAR(255) UNIQUE
);

-- ========================
-- BẢNG ĐỊA CHỈ
-- ========================
CREATE TABLE IF NOT EXISTS DiaChi (
    maDiaChi VARCHAR(255) PRIMARY KEY,
    hoTenNguoiNhan VARCHAR(255),
    soDienThoaiNguoiNhan VARCHAR(255),
    diaChiNhanHang VARCHAR(255),
    laMacDinh TINYINT(1),
    maKhachHang VARCHAR(255),
    FOREIGN KEY (maKhachHang) REFERENCES KhachHang(maKhachHang)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================
-- BẢNG DANH MỤC
-- ========================
CREATE TABLE IF NOT EXISTS DanhMuc (
    maDanhMuc VARCHAR(255) PRIMARY KEY,
    tenDanhMuc VARCHAR(255),
    maQuanTriVien VARCHAR(255),
    anhMinhHoaDM VARCHAR(255),
    FOREIGN KEY (maQuanTriVien) REFERENCES QuanTriVien(maQuanTriVien)
        ON DELETE SET NULL ON UPDATE CASCADE
);
-- jjj
-- ========================
-- BẢNG SẢN PHẨM
-- ========================
CREATE TABLE IF NOT EXISTS SanPham (
    maSanPham VARCHAR(255) PRIMARY KEY,
    tenSanPham VARCHAR(255),
    moTa VARCHAR(255),
    giaNhap DECIMAL(15,3),
    giaBan DECIMAL(15,3),
    soLuongTon INTEGER(10),
    anhMinhHoaSP VARCHAR(255),
    thuongHieu VARCHAR(255),
    tinhTrang VARCHAR(255),
    maDanhMuc VARCHAR(255),
    FOREIGN KEY (maDanhMuc) REFERENCES DanhMuc(maDanhMuc)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ========================
-- BẢNG THÔNG SỐ KỸ THUẬT
-- ========================
CREATE TABLE IF NOT EXISTS ThongSoKyThuat (
    maSanPham VARCHAR(255) PRIMARY KEY,
    ram VARCHAR(255),
    rom VARCHAR(255),
    cpu VARCHAR(255),
    cardDH VARCHAR(255),
    soKheRam VARCHAR(255),
    kichThuocMH VARCHAR(255),
    pin VARCHAR(255),
    hdh VARCHAR(255),
    congNgheMH VARCHAR(255),
    doPhanGiaiMH VARCHAR(255),
    port VARCHAR(255),
    FOREIGN KEY (maSanPham) REFERENCES SanPham(maSanPham)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================
-- BẢNG GIỎ HÀNG
-- ========================
CREATE TABLE IF NOT EXISTS GioHang (
    maGioHang VARCHAR(255) PRIMARY KEY,
    tongTien INTEGER(10),
    maKhachHang VARCHAR(255),
    FOREIGN KEY (maKhachHang) REFERENCES KhachHang(maKhachHang)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================
-- BẢNG CHI TIẾT GIỎ HÀNG
-- ========================
CREATE TABLE IF NOT EXISTS ChiTietGioHang (
    SanPhammaSanPham VARCHAR(255),
    GioHangmaGioHang VARCHAR(255),
    soLuong INTEGER(10),
    PRIMARY KEY (SanPhammaSanPham, GioHangmaGioHang),
    FOREIGN KEY (SanPhammaSanPham) REFERENCES SanPham(maSanPham)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (GioHangmaGioHang) REFERENCES GioHang(maGioHang)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================
-- BẢNG ĐƠN HÀNG
-- ========================
CREATE TABLE IF NOT EXISTS DonHang (
    maDonHang VARCHAR(255) PRIMARY KEY,
    ngayDatHang DATE,
    tongGiaTri DECIMAL(15,3),
    trangThai VARCHAR(255),
    phuongThucThanhToan VARCHAR(255),
    ghiChu VARCHAR(255),
    maKhachHang VARCHAR(255),
    maDiaChi VARCHAR(255),
    maQuanTriVien VARCHAR(255),
    FOREIGN KEY (maKhachHang) REFERENCES KhachHang(maKhachHang)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (maDiaChi) REFERENCES DiaChi(maDiaChi)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (maQuanTriVien) REFERENCES QuanTriVien(maQuanTriVien)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ========================
-- BẢNG CHI TIẾT ĐƠN HÀNG
-- ========================
CREATE TABLE IF NOT EXISTS ChiTietDonHang (
    maChiTiet INT(10) PRIMARY KEY,
    soLuong INT(10),
    donGia DECIMAL(15,3),
    maSanPham VARCHAR(255),
    maDonHang VARCHAR(255),
    FOREIGN KEY (maSanPham) REFERENCES SanPham(maSanPham)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (maDonHang) REFERENCES DonHang(maDonHang)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================
-- BẢNG ĐÁNH GIÁ
-- ========================
CREATE TABLE IF NOT EXISTS DanhGia (
    maDanhGia VARCHAR(255) PRIMARY KEY,
    noiDung VARCHAR(255),
    soSao TINYINT(5),
    ngayDanhGia DATE,
    maChiTiet INT(10),
    FOREIGN KEY (maChiTiet) REFERENCES ChiTietDonHang(maChiTiet)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================
-- BẢNG BÁO CÁO THỐNG KÊ
-- ========================
CREATE TABLE IF NOT EXISTS BaoCaoThongKe (
    maBaoCao VARCHAR(255) PRIMARY KEY,
    loaiBaoCao VARCHAR(255),
    thoiGianLap TIMESTAMP,
    noiDung VARCHAR(255),
    maQuanTriVien VARCHAR(255),
    FOREIGN KEY (maQuanTriVien) REFERENCES QuanTriVien(maQuanTriVien)
        ON DELETE CASCADE ON UPDATE CASCADE
);
