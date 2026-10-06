USE lapzone;

-- Dữ liệu minh họa dành cho chạy thử. Chỉ nhập vào database trống.
-- ========================
-- 1. QUẢN TRỊ VIÊN
-- ========================
INSERT INTO QuanTriVien VALUES
('QTV001', 'Nguyen Admin', 'admin', '123456', 'admin@lapzone.com', '0900000001');

-- ========================
-- 2. DANH MỤC
-- ========================
INSERT INTO DanhMuc VALUES
('DM01', 'Gaming', 'QTV001', '/images/asus_tuf_gaming_f16_fx607vj.png'),
('DM02', 'Văn phòng', 'QTV001', '/images/Dell_Vostro_3520.png'),
('DM03', 'Laptop AI', 'QTV001', '/images/asus_vivobook_s15_ai.png'),
('DM04', 'Mỏng - nhẹ', 'QTV001','/images/Acer_Swift_3.png'),
('DM05', 'Đồ họa - kỹ thuật', 'QTV001','/images/asus_pro_art_studio_book.png');

-- ========================
-- 3. KHÁCH HÀNG
-- ========================
INSERT INTO KhachHang VALUES
('KH001', 'Trần Văn A', 'user1', 'user1@gmail.com', '123456', '0911000001', 'Hoạt động'),
('KH002', 'Nguyễn Thị B', 'user2', 'user2@gmail.com', '123456', '0911000002', 'Hoạt động'),
('KH003', 'Phạm Nhật C', 'user3', 'user3@gmail.com', '123456', '0911000003', 'Hoạt động');

-- ========================
-- 4. ĐỊA CHỈ
-- ========================
INSERT INTO DiaChi VALUES
('DC01', 'Trần Văn A', '0911000001', 'Hà Nội', 1, 'KH001'),
('DC02', 'Nguyễn Thị B', '0911000002', 'Đà Nẵng', 1, 'KH002'),
('DC03', 'Phạm Nhật C', '0911000003', 'TP.HCM', 1, 'KH003');

-- ========================
-- 5. SẢN PHẨM
-- ========================
INSERT INTO SanPham (maSanPham, tenSanPham, moTa, giaNhap, giaBan, soLuongTon, anhMinhHoaSP, thuongHieu, tinhTrang, maDanhMuc) VALUES
('SPG01', 'Acer Gaming Aspire 5 A515', 'Gaming cơ bản', 13500000.000, 15990000.000, 20, '/images/acer_gaming_aspire_5_a515.png', 'Acer', 'Còn hàng', 'DM01'),
('SPG02', 'Dell Inspiron 15 3530', 'Gaming phổ thông', 15000000.000, 17490000.000, 15, '/images/dell_inspiron_15_3530.png', 'Dell', 'Còn hàng', 'DM01'),
('SPG03', 'Asus TUF Gaming F16 FX607VJ', 'Gaming RTX 4060', 19000000.000, 22190000.000, 12, '/images/asus_tuf_gaming_f16_fx607vj.png', 'Asus', 'Còn hàng', 'DM01'),
('SPG04', 'MSI Gaming Thin GF63', 'Gaming RTX 2050', 12500000.000, 14990000.000, 18, '/images/laptop-msi-gaming-gf63.png', 'MSI', 'Còn hàng', 'DM01'),
('SPG05', 'Razer Blade 16', 'Gaming cao cấp, RTX 4070', 42000000.000, 49990000.000, 5, '/images/razer-blade-16.png', 'Razer', 'Còn hàng', 'DM01'),
('SPG06', 'MSI Katana GF66', 'Gaming RTX 3060', 19000000.000, 22990000.000, 12, '/images/msi_katana_gf66.png', 'MSI', 'Còn hàng', 'DM01'),
('SPG07', 'Asus ROG Strix G15', 'Gaming RTX 4060', 25500000.000, 29990000.000, 10, '/images/asus-rog-strix-g15.png', 'Asus', 'Còn hàng', 'DM01'),
('SPG08', 'Dell G15 5520', 'Gaming phổ thông, GTX 1650', 19000000.000, 21990000.000, 15, '/images/dell-g15-5520.png', 'Dell', 'Còn hàng', 'DM01'),
('SPG09', 'Acer Predator Helios 16', 'Gaming RTX 4070', 38000000.000, 45990000.000, 6, '/images/acer-predator-helios-16.png', 'Acer', 'Còn hàng', 'DM01'),
('SPG10', 'Lenovo Legion 5 Pro', 'Gaming RTX 4070', 37000000.000, 43990000.000, 7, '/images/lenovo-legion-5-pro.png', 'Lenovo', 'Còn hàng', 'DM01'),
('SPG11', 'Asus ROG Flow X16', 'Gaming 16″, RTX 4060', 40000000.000, 47990000.000, 5, '/images/asus-rog-flow-x16.png', 'Asus', 'Còn hàng', 'DM01'),
('SPG12', 'Razer Blade 15 Advanced', 'Gaming RTX 4070', 41000000.000, 48990000.000, 6, '/images/Razer-Blade-15-Advanced.png', 'Razer', 'Còn hàng', 'DM01'),
('SPG13', 'MSI Raider GE78', 'Gaming RTX 4080', 50000000.000, 59990000.000, 4, '/images/msi_raider_ge78.png', 'MSI', 'Còn hàng', 'DM01'),
('SPG14', 'Asus ROG Strix G18', 'Gaming 18″, RTX 4090', 50000000.000, 61990000.000, 3, '/images/Asus-ROG-Strix-G18.png', 'Asus', 'Còn hàng', 'DM01'),
('SPG15', 'Dell Alienware M18', 'Gaming RTX 4090', 52000000.000, 63990000.000, 2, '/images/dell-alienware-m18.png', 'Dell', 'Còn hàng', 'DM01'),
('SPV01', 'HP 245 G10', 'Laptop học tập', 10500000.000, 12390000.000, 25, '/images/HP_245_G10.png', 'HP', 'Còn hàng', 'DM02'),
('SPV02', 'Acer Aspire Lite 15 AL15', 'Văn phòng mỏng nhẹ', 12000000.000, 14490000.000, 10, '/images/Acer_Aspire_Lite_15_AL15.png', 'Acer', 'Còn hàng', 'DM02'),
('SPV03', 'Dell Vostro 3520', 'Văn phòng bền bỉ', 11500000.000, 13990000.000, 15, '/images/Dell_Vostro_3520.png', 'Dell', 'Còn hàng', 'DM02'),
('SPV04', 'Lenovo V15 G3', 'Laptop văn phòng 15″', 13500000.000, 15490000.000, 20, '/images/lenovo_v15_g3.png', 'Lenovo', 'Còn hàng', 'DM02'),
('SPV05', 'HP ProBook 450 G9', 'Laptop văn phòng bền bỉ', 15000000.000, 17490000.000, 18, '/images/hp-probook-450-g9.png', 'HP', 'Còn hàng', 'DM02'),
('SPV06', 'Dell Vostro 5410', 'Văn phòng mỏng nhẹ', 14000000.000, 16490000.000, 12, '/images/dell-vostro-5410.png', 'Dell', 'Còn hàng', 'DM02'),
('SPV07', 'Acer TravelMate P2', 'Laptop doanh nghiệp, 14″', 13000000.000, 15990000.000, 14, '/images/acer-traverl-mate-p2.png', 'Acer', 'Còn hàng', 'DM02'),
('SPV08', 'Asus ExpertBook P2', 'Văn phòng nhẹ, pin lâu', 12500000.000, 14990000.000, 16, '/images/laptop-asus-expertbook-p2.png', 'Asus', 'Còn hàng', 'DM02'),
('SPV09', 'Acer Aspire 5 Pro', 'Văn phòng 15″', 13500000.000, 15990000.000, 12, '/images/acer-aspire-5-pro.png', 'Acer', 'Còn hàng', 'DM02'),
('SPV10', 'HP ProBook 455 G9', 'Laptop doanh nghiệp', 15000000.000, 17490000.000, 10, '/images/hp-probook-450-g9.png', 'HP', 'Còn hàng', 'DM02'),
('SPV11', 'Lenovo ThinkBook 15 G4', 'Văn phòng mỏng nhẹ', 16000000.000, 18990000.000, 10, '/images/Lenovo-ThinkBook-15-G4.png', 'Lenovo', 'Còn hàng', 'DM02'),
('SPV12', 'Acer TravelMate P4', 'Văn phòng 14″, pin lâu', 14500000.000, 16990000.000, 10, '/images/Acer-TravelMate-P4.png', 'Acer', 'Còn hàng', 'DM02'),
('SPA01', 'MSI VenturePro 16 AI', 'Laptop hỗ trợ AI mạnh', 29000000.000, 33690000.000, 6, '/images/msi_venture_a16_ai.png', 'MSI', 'Còn hàng', 'DM03'),
('SPA02', 'Asus Vivobook S15 AI', 'Laptop AI văn phòng', 24500000.000, 28490000.000, 9, '/images/asus_vivobook_s15_ai.png', 'Asus', 'Còn hàng', 'DM03'),
('SPA03', 'Asus Vivobook AI Pro 15', 'Laptop AI văn phòng', 24500000.000, 28490000.000, 8, '/images/Asus-Vivobook-AI-Pro-15.png', 'Asus', 'Còn hàng', 'DM03'),
('SPA04', 'MSI VenturePro 16 AI Plus', 'Laptop AI mạnh mẽ', 29000000.000, 33690000.000, 5, '/images/msi_venture_a16_ai.png', 'MSI', 'Còn hàng', 'DM03'),
('SPA05', 'Dell XPS AI 15', 'AI học tập và văn phòng', 27000000.000, 30990000.000, 7, '/images/Dell-XPS-AI-15.png', 'Dell', 'Còn hàng', 'DM03'),
('SPA06', 'HP AI Spectre 16', 'Laptop AI cao cấp', 28000000.000, 32990000.000, 6, '/images/HP-AI-Spectre-16.png', 'HP', 'Còn hàng', 'DM03'),
('SPA07', 'Lenovo AI ThinkPad 15', 'Laptop AI bền bỉ', 26000000.000, 29990000.000, 8, '/images/lenovo_thinkpad_15.png', 'Lenovo', 'Còn hàng', 'DM03'),
('SPA08', 'MSI VenturePro AI 17', 'Laptop AI mạnh', 30000000.000, 35990000.000, 5, '/images/venturepro-17-ai.png', 'MSI', 'Còn hàng', 'DM03'),
('SPA09', 'Asus ProArt Studio AI 16', 'AI + Đồ họa 16″', 32000000.000, 38990000.000, 5, '/images/Asus-ProArt-Studiobook-16.png', 'Asus', 'Còn hàng', 'DM03'),
('SPA10', 'MSI VenturePro AI 14', 'Laptop AI 14″', 27000000.000, 31990000.000, 6, '/images/MSI-VenturePro-AI-14.png', 'MSI', 'Còn hàng', 'DM03'),
('SPM01', 'Lenovo Ideapad Slim 3', 'Gọn nhẹ hàng ngày', 16000000.000, 19190000.000, 18, '/images/Lenovo_Ideapad_Slim.png', 'Lenovo', 'Còn hàng', 'DM04'),
('SPM02', 'Acer Swift 3', 'Mỏng nhẹ cao cấp', 17000000.000, 20490000.000, 8, '/images/Acer_Swift_3.png', 'Acer', 'Còn hàng', 'DM04'),
('SPM03', 'Asus Zenbook 14', 'Ultrabook mỏng nhẹ', 18500000.000, 21990000.000, 10, '/images/Asus-Zenbook-14.png', 'Asus', 'Còn hàng', 'DM04'),
('SPM04', 'Acer Swift 5', 'Laptop mỏng nhẹ, pin lâu', 20000000.000, 23990000.000, 8, '/images/acer-swift-5.png', 'Acer', 'Còn hàng', 'DM04'),
('SPM05', 'Dell XPS 13', 'Ultrabook 13″ siêu nhẹ', 25000000.000, 29990000.000, 7, '/images/Dell-XPS-13.png', 'Dell', 'Còn hàng', 'DM04'),
('SPM06', 'HP Spectre x360 14', 'Mỏng nhẹ, 2-in-1', 27000000.000, 32990000.000, 6, '/images/HP-AI-Spectre-16.png', 'HP', 'Còn hàng', 'DM04'),
('SPM07', 'Lenovo Yoga Slim 7', 'Laptop mỏng nhẹ, OLED', 22000000.000, 27990000.000, 9, '/images/lenovo-yoga-slim.png', 'Lenovo', 'Còn hàng', 'DM04'),
('SPM08', 'Asus Zenbook Flip 14', 'Mỏng nhẹ 2-in-1', 23000000.000, 26990000.000, 8, '/images/asus-zenbook-flip-14.png', 'Asus', 'Còn hàng', 'DM04'),
('SPM09', 'HP Spectre 16', 'Mỏng nhẹ 16″', 25000000.000, 29990000.000, 7, '/images/HP-AI-Spectre-16.png', 'HP', 'Còn hàng', 'DM04'),
('SPM10', 'Lenovo Yoga Slim 7i Carbon', 'Mỏng nhẹ, doanh nhân', 23000000.000, 27990000.000, 8, '/images/lenovo-yoga_slim_7_carbon.png', 'Lenovo', 'Còn hàng', 'DM04'),
('SPD01', 'MacBook Air 13 M4', 'Đồ họa nhẹ nhàng', 22000000.000, 25590000.000, 12, '/images/macbook_air_m14.png', 'Apple', 'Còn hàng', 'DM05'),
('SPD02', 'Asus ProArt Studiobook', 'Đồ họa chuyên sâu', 31500000.000, 36990000.000, 7, '/images/asus_pro_art_studio_book.png', 'Asus', 'Còn hàng', 'DM05'),
('SPD03', 'MacBook Pro 14 M3', 'Đồ họa mạnh mẽ', 36000000.000, 41990000.000, 5, '/images/macbook-pro-14-m3.png', 'Apple', 'Còn hàng', 'DM05'),
('SPD04', 'Asus ProArt Studiobook 16', 'Workstation đồ họa', 31500000.000, 36990000.000, 7, '/images/Asus-ProArt-Studiobook-16.png', 'Asus', 'Còn hàng', 'DM05'),
('SPD05', 'MSI Creator 17', 'Đồ họa chuyên nghiệp', 45000000.000, 52990000.000, 3, '/images/msi-creator-17.png', 'MSI', 'Còn hàng', 'DM05'),
('SPD06', 'Dell Precision 5560', 'Workstation đồ họa/kiến trúc', 42000000.000, 49990000.000, 4, '/images/Dell-Precision-5560.png', 'Dell', 'Còn hàng', 'DM05'),
('SPD07', 'HP ZBook Fury 17 G8', 'Đồ họa/ kỹ thuật nặng', 48000000.000, 56990000.000, 3, '/images/hp-zbook-fury-17-g8.png', 'HP', 'Còn hàng', 'DM05'),
('SPD08', 'Dell Precision 5570', 'Workstation đồ họa 16″', 43000000.000, 50990000.000, 4, '/images/dell-precision-5570.png', 'Dell', 'Còn hàng', 'DM05'),
('SPD09', 'MSI Creator Z16', 'Workstation đồ họa 16″', 45000000.000, 52990000.000, 3, '/images/msi-creator-z16.png', 'MSI', 'Còn hàng', 'DM05'),
('SPD10', 'HP ZBook Studio G8', 'Đồ họa/kiến trúc 16″', 39000000.000, 45990000.000, 4, '/images/HP-Zbook-Studio-G8.png', 'HP', 'Còn hàng', 'DM05');

-- ========================
-- 6. THÔNG SỐ KỸ THUẬT
-- Thông số minh họa cho dữ liệu chạy thử.
-- ========================
INSERT INTO ThongSoKyThuat VALUES
('SPG01','16GB','512GB','i5-12450H','RTX2050','2 khe','15.6"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPG02','16GB','512GB','i5-12450H','RTX2050','2 khe','15.6"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPG03','16GB','512GB','i5-12450H','RTX2050','2 khe','15.6"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPG04','16GB','512GB','i5-12450H','RTX2050','2 khe','15.6"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPG05','32GB','1TB','i7-13700H','RTX4070','2 khe','16"','4 cell','Win11','IPS','QHD','USB-C,HDMI'),
('SPG06','16GB','512GB','i5-12500H','RTX3060','2 khe','15.6"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPG07','16GB','1TB','i7-12700H','RTX4060','2 khe','15.6"','4 cell','Win11','IPS','QHD','USB-C,HDMI'),
('SPG08','16GB','512GB','i5-12450H','GTX1650','2 khe','15.6"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPG09','32GB','1TB','i7-13700H','RTX4070','2 khe','16"','4 cell','Win11','IPS','QHD','USB-C,HDMI'),
('SPG10','32GB','1TB','Ryzen 9 7945HX','RTX4070','2 khe','16"','4 cell','Win11','IPS','QHD','USB-C,HDMI'),
('SPG11','32GB','1TB','i7-13700H','RTX4060','2 khe','16"','4 cell','Win11','IPS','QHD','USB-C,HDMI'),
('SPG12','32GB','1TB','i7-13700H','RTX4070','2 khe','15.6"','4 cell','Win11','IPS','QHD','USB-C,HDMI'),
('SPG13','64GB','2TB','i9-13900HX','RTX4080','4 khe','17.3"','6 cell','Win11','IPS','4K','USB-C,HDMI,TB4'),
('SPG14','64GB','2TB','i9-13900HX','RTX4090','4 khe','18"','6 cell','Win11','IPS','4K','USB-C,HDMI,TB4'),
('SPG15','64GB','2TB','i9-13950HX','RTX4090','4 khe','18"','6 cell','Win11','IPS','4K','USB-C,HDMI,TB4'),
('SPV01','8GB','256GB','Ryzen 5 7520U','Radeon','1 khe','14"','3 cell','Win11','TN','FHD','USB,HDMI'),
('SPV02','8GB','256GB','Ryzen 5 7520U','Radeon','1 khe','14"','3 cell','Win11','TN','FHD','USB,HDMI'),
('SPV03','8GB','256GB','Ryzen 5 7520U','Radeon','1 khe','14"','3 cell','Win11','TN','FHD','USB,HDMI'),
('SPV04','16GB','512GB','i5-1240P','Intel UHD','2 khe','15.6"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPV05','16GB','512GB','i5-1240P','Intel UHD','2 khe','15.6"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPV06','16GB','512GB','i5-1240P','Intel UHD','2 khe','15.6"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPV07','16GB','512GB','i5-1240P','Intel UHD','2 khe','14"','3 cell','Win11','IPS','FHD','USB,HDMI'),
('SPV08','16GB','512GB','i5-1240P','Intel UHD','2 khe','14"','3 cell','Win11','IPS','FHD','USB,HDMI'),
('SPV09','16GB','512GB','i5-1240P','Intel UHD','2 khe','15.6"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPV10','16GB','512GB','i5-1240P','Intel UHD','2 khe','15.6"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPV11','16GB','512GB','i5-1240P','Intel UHD','2 khe','15.6"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPV12','16GB','512GB','i5-1240P','Intel UHD','2 khe','14"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPA01','32GB','1TB','Intel Ultra 7','RTX4070','2 khe','16"','4 cell','Win11 AI','OLED','QHD+','TB4'),
('SPA02','32GB','1TB','i7-13700H','RTX4070','2 khe','15.6"','4 cell','Win11 AI','IPS','QHD','USB-C,HDMI'),
('SPA03','32GB','1TB','i7-13700H','RTX4070','2 khe','15.6"','4 cell','Win11 AI','IPS','QHD','USB-C,HDMI'),
('SPA04','32GB','1TB','i7-13700H','RTX4070','2 khe','16"','4 cell','Win11 AI','OLED','QHD+','USB-C,HDMI'),
('SPA05','32GB','1TB','i7-13700H','RTX4060','2 khe','15.6"','4 cell','Win11 AI','IPS','QHD','USB-C,HDMI'),
('SPA06','32GB','1TB','i7-13700H','RTX4070','2 khe','16"','4 cell','Win11 AI','IPS','QHD','USB-C,HDMI'),
('SPA07','32GB','1TB','i7-13700H','RTX4060','2 khe','15.6"','4 cell','Win11 AI','IPS','QHD','USB-C,HDMI'),
('SPA08','32GB','1TB','i7-13700H','RTX4070','2 khe','17"','4 cell','Win11 AI','OLED','QHD+','USB-C,HDMI'),
('SPA09','32GB','1TB','i7-13700H','RTX4070','2 khe','16"','4 cell','Win11 AI','OLED','QHD+','USB-C,HDMI'),
('SPA10','32GB','1TB','i7-13700H','RTX4060','2 khe','14"','4 cell','Win11 AI','IPS','QHD','USB-C,HDMI'),
('SPM01','8GB','512GB','i5-12450H','Intel UHD','1 khe','14"','3 cell','Win11','IPS','FHD','USB-C'),
('SPM02','8GB','512GB','i5-12450H','Intel UHD','1 khe','14"','3 cell','Win11','IPS','FHD','USB-C'),
('SPM03','16GB','512GB','i5-1240P','Intel UHD','2 khe','14"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPM04','16GB','512GB','i5-1240P','Intel UHD','2 khe','14"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPM05','16GB','512GB','i7-1255U','Intel Iris Xe','2 khe','13"','3 cell','Win11','IPS','QHD','USB-C,HDMI'),
('SPM06','16GB','512GB','i7-1255U','Intel Iris Xe','2 khe','14"','3 cell','Win11','IPS','QHD','USB-C,HDMI'),
('SPM07','16GB','512GB','i7-1255U','Intel Iris Xe','2 khe','14"','3 cell','Win11','IPS','OLED','USB-C,HDMI'),
('SPM08','16GB','512GB','i7-1255U','Intel Iris Xe','2 khe','14"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPM09','16GB','512GB','i7-1255U','Intel Iris Xe','2 khe','16"','3 cell','Win11','IPS','FHD','USB-C,HDMI'),
('SPM10','16GB','512GB','i7-1255U','Intel Iris Xe','2 khe','14"','3 cell','Win11','IPS','OLED','USB-C,HDMI'),
('SPD01','16GB','256GB','Apple M4','Tích hợp','Không khe','13.6"','Li-ion','macOS','Retina','2560x1664','USB-C'),
('SPD02','16GB','256GB','Apple M4','Tích hợp','Không khe','13.6"','Li-ion','macOS','Retina','2560x1664','USB-C'),
('SPD03','32GB','1TB','M2 Pro','Tích hợp','Không khe','14.2"','Li-ion','macOS','Retina','3024x1964','USB-C'),
('SPD04','32GB','1TB','i9-12950HX','RTX4070','2 khe','16"','4 cell','Win11','IPS','QHD','USB-C,HDMI'),
('SPD05','64GB','2TB','i9-13900HX','RTX4080','4 khe','16"','6 cell','Win11','IPS','4K','USB-C,HDMI,TB4'),
('SPD06','64GB','2TB','i9-13900HX','RTX4080','4 khe','16"','6 cell','Win11','IPS','4K','USB-C,HDMI,TB4'),
('SPD07','64GB','2TB','i9-13900HX','RTX4090','4 khe','17"','6 cell','Win11','IPS','4K','USB-C,HDMI,TB4'),
('SPD08','64GB','2TB','i9-13900HX','RTX4080','4 khe','16"','6 cell','Win11','IPS','4K','USB-C,HDMI,TB4'),
('SPD09','64GB','2TB','i9-13900HX','RTX4080','4 khe','16"','6 cell','Win11','IPS','4K','USB-C,HDMI,TB4'),
('SPD10','64GB','2TB','i9-13900HX','RTX4070','4 khe','16"','6 cell','Win11','IPS','4K','USB-C,HDMI,TB4');



-- ========================
-- 7. GIỎ HÀNG
-- ========================
INSERT INTO GioHang VALUES
('GH001', 0, 'KH001'),
('GH002', 0, 'KH002'),
('GH003', 0, 'KH003');

-- ========================
-- 8. CHI TIẾT GIỎ HÀNG
-- ========================
INSERT INTO ChiTietGioHang VALUES
('SPG01','GH001',1),
('SPV01','GH001',1),
('SPD01','GH002',1),
('SPM01','GH003',2);

-- ========================
-- 9. ĐƠN HÀNG
-- ========================
INSERT INTO DonHang VALUES
('DH001','2025-01-10',33480000.000,'Hoàn thành','Chuyển khoản','Giao nhanh','KH001','DC01','QTV001'),
('DH002','2025-01-12',25590000.000,'Hoàn thành','COD','Không ghi chú','KH002','DC02','QTV001');

-- ========================
-- 10. CHI TIẾT ĐƠN HÀNG
-- ========================
INSERT INTO ChiTietDonHang VALUES
(1,1,15990000.000,'SPG01','DH001'),
(2,1,17490000.000,'SPG02','DH001'),
(3,1,25590000.000,'SPD01','DH002');

-- ========================
-- 11. ĐÁNH GIÁ
-- ========================
INSERT INTO DanhGia VALUES
('DG01','Máy chạy mượt, rất hài lòng',5,'2025-01-15',1),
('DG02','Màn hình đẹp, pin ổn',4,'2025-01-18',3);

