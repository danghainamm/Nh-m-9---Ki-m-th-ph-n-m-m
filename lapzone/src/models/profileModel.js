const db = require('../config/db');

module.exports = {
    getOne: async (maKhachHang) => {
        try {
            const sql = `
                SELECT KH.*, DC.diaChiNhanHang
                FROM KhachHang KH
                LEFT JOIN DiaChi DC ON KH.maKhachHang = DC.maKhachHang AND DC.laMacDinh = 1
                WHERE KH.maKhachHang = ?
            `;

            const [rows] = await db.query(sql, [maKhachHang]);
            return rows[0];
        } catch (error) {
            console.error("Lỗi model profile:", error.code || error.message);
            throw error;
        }
    },

    update: async (id, data) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query('SELECT maKhachHang FROM KhachHang WHERE maKhachHang = ? FOR UPDATE', [id]);

            const sqlUser = `
                UPDATE KhachHang
                SET hoTen = ?, soDienThoai = ?, email = ?
                WHERE maKhachHang = ?
            `;
            await connection.query(sqlUser, [data.hoTen, data.soDienThoai, data.email, id]);

            if (data.diaChiNhanHang) {
                const [checkAddr] = await connection.query(
                    'SELECT maDiaChi FROM DiaChi WHERE maKhachHang = ? AND laMacDinh = 1',
                    [id]
                );

                if (checkAddr.length > 0) {
                    const sqlUpdateAddr = `
                        UPDATE DiaChi SET diaChiNhanHang = ?, hoTenNguoiNhan = ?, soDienThoaiNguoiNhan = ?
                        WHERE maKhachHang = ? AND laMacDinh = 1
                    `;
                    await connection.query(sqlUpdateAddr, [data.diaChiNhanHang, data.hoTen, data.soDienThoai, id]);
                } else {
                    const newMaDiaChi = require('crypto').randomUUID();

                    const sqlInsertAddr = `
                        INSERT INTO DiaChi (maDiaChi, hoTenNguoiNhan, soDienThoaiNguoiNhan, diaChiNhanHang, laMacDinh, maKhachHang)
                        VALUES (?, ?, ?, ?, 1, ?)
                    `;
                    await connection.query(sqlInsertAddr, [newMaDiaChi, data.hoTen, data.soDienThoai, data.diaChiNhanHang, id]);
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            console.error("Lỗi update profile:", error.code || error.message);
            throw error;
        } finally {
            connection.release();
        }
    }
};
