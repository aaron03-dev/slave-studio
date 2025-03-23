const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let completedSlaves = {}; // Lưu trạng thái các slave theo IP

// Nhận trạng thái từ slave
app.post('/slave-status', (req, res) => {
    const { slaveIp, status } = req.body;
    console.log(`📥 Slave ${slaveIp} gửi trạng thái: ${status}`);

    if (status === 'done') {
        completedSlaves[slaveIp] = true;
    }

    res.status(200).json({ message: 'Master đã nhận trạng thái.' });
});

app.get('/slave-status', (req, res) => {
    res.json(completedSlaves); // trả về trạng thái của từng slave
});


// API để frontend lấy danh sách slave đã xong
app.get('/completed-slaves', (req, res) => {
    res.json(completedSlaves);
});

app.listen(PORT, () => {
    console.log(`🚀 Master server chạy tại http://localhost:${PORT}`);
});
