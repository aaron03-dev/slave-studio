const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

const ftp =  require('basic-ftp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

app.use(cors());
app.use(express.json());

let completedSlaves = []; // Lưu trạng thái các slave theo IP

// Nhận trạng thái từ slave
app.post('/slave-status', (req, res) => {
    const { slaveIp, status, folderName } = req.body;
    console.log(`📥 Slave ${slaveIp} gửi trạng thái: ${status}`);

    if (status === 'done') {
        completedSlaves.push({
            ip: slaveIp,
            done: true,
            folder: folderName,
            status: 'waiting'
        });
    }

    res.status(200).json({ message: 'Master đã nhận trạng thái.' });
});

// Trả về danh sách slave đã xong
app.get('/completed-slaves', (req, res) => {
    res.json(completedSlaves);
});

// Route tải thư mục từ slave
app.get('/download', async (req, res) => {
    const slaveIp = req.query.ip; // Ví dụ: /download?ip=192.168.1.10
    const folder = req.query.folder
    console.log(slaveIp, folder)
    if (!slaveIp) {
        return res.status(400).json({ error: 'Thiếu IP của slave' });
    }

    try {
        await downloadFolderFromSlave(slaveIp, folder);
        res.status(200).json({ message: 'Tải thư mục thành công từ slave ' + slaveIp });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi tải thư mục: ' + err.message });
    }
});



async function downloadFolderFromSlave(slaveIp, folder) {
    try {
        const folderName = folder;
        const zipFileName = `${folderName}.zip`;
        const remoteFolder = `D:\\${folderName}`;
        const localZipPath = path.join("D:/", zipFileName);
        console.log(`📦 Tải file: ${zipFileName} từ ${remoteFolder} về ${localZipPath}`);
        

        // 1. Yêu cầu slave nén thư mục và bật FTP
        await axios.post(`${slaveIp}/start-ftp?folder=${encodeURIComponent(remoteFolder)}`);
        console.log(`⚙️ Đã yêu cầu slave bật FTP chia sẻ file ZIP`);

        // 2. Kết nối FTP và tải file ZIP
        const client = new ftp.Client();
        client.ftp.verbose = true;

        await client.access({
            host: slaveIp.replace(/^https?:\/\//, "").split(":")[0],
            port: 2121, // Cổng FTP
            user: "slave12",
            password: "",
            secure: false
        });

        console.log(`✅ Đã kết nối FTP tới ${slaveIp}`);

        // Tải file ZIP về máy
        await client.downloadTo(localZipPath, zipFileName);
        console.log(`🎉 Đã tải file ZIP thành công từ ${slaveIp}`);

        client.close();
    } catch (err) {
        console.error(`❌ Lỗi khi tải file ZIP từ ${slaveIp}:`, err.message);
        throw err;
    }
}



app.listen(PORT, () => {
    console.log(`🚀 Master server chạy tại http://localhost:${PORT}`);
});
