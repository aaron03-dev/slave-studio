import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const slaves = [
    {
        name: 'Slave 1',
        ip: 'http://192.168.100.212:3002', // Sửa IP theo thực tế
    },
];

function App() {
    const [statuses, setStatuses] = useState({});
    const [fileAll, setFileAll] = useState(null);
    const [loading, setLoading] = useState(false);
    const [folderName, setFolderName] = useState('');

    const [completedSlaves, setCompletedSlaves] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            axios.get('http://localhost:3001/completed-slaves')
                .then((res) => {
                    setCompletedSlaves(res.data);
                })
                .catch((err) => {
                    console.error('Lỗi lấy trạng thái từ master:', err);
                });
        }, 3000); // polling mỗi 3 giây

        return () => clearInterval(interval); // clear khi component unmount
    }, []);

    const handleDownload = (ip) => {
        window.open(`http://localhost:3002/download`, '_blank');
    };

    const updateStatus = (ip, message) => {
        setStatuses((prev) => ({ ...prev, [ip]: message }));
    };

    const handleStartSlave = async (slave) => {
        if (!folderName) {
            alert('Vui lòng nhập tên thư mục để lưu kết quả!');
            return;
        }

        try {
            updateStatus(slave.ip, '▶ Starting...');
            const res = await axios.post(`${slave.ip}/start`, { folderName });
            updateStatus(slave.ip, `▶ ${res.data.message}`);
        } catch (err) {
            updateStatus(slave.ip, `❌ Failed: ${err.message}`);
        }
    };

    const handleStopSlave = async (slave) => {
        try {
            updateStatus(slave.ip, '🛑 Stopping...');
            const res = await axios.post(`${slave.ip}/stop`);
            updateStatus(slave.ip, `🛑 ${res.data.message}`);
        } catch (err) {
            updateStatus(slave.ip, `❌ Stop Failed: ${err.message}`);
        }
    };

    const handleStartAll = async () => {
        setLoading(true);
        for (const slave of slaves) {
            await handleStartSlave(slave);
        }
        setLoading(false);
    };

    const handleUploadExeToAll = async () => {
        if (!fileAll) {
            alert('Vui lòng chọn file .exe!');
            return;
        }

        setLoading(true);
        for (const slave of slaves) {
            const formData = new FormData();
            formData.append('file', fileAll);
            updateStatus(slave.ip, '⬆️ Uploading EXE...');

            try {
                const res = await axios.post(`${slave.ip}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                updateStatus(slave.ip, `✅ ${res.data.message}`);
            } catch (err) {
                updateStatus(slave.ip, `❌ Upload Failed: ${err.message}`);
            }
        }
        setLoading(false);
    };

    const handleDeleteAll = async () => {
        setLoading(true);
        for (const slave of slaves) {
            try {
                const res = await axios.delete(`${slave.ip}/delete`);
                updateStatus(slave.ip, `🗑 ${res.data.message}`);
            } catch (err) {
                updateStatus(slave.ip, `❌ Delete Failed: ${err.message}`);
            }
        }
        setLoading(false);
    };

    const handleStopAll = async () => {
        setLoading(true);
        for (const slave of slaves) {
            await handleStopSlave(slave);
        }
        setLoading(false);
    };

    const handleStream = (slave) => {
        window.open('http://127.0.0.1:5000/'); // Tuỳ chỉnh link stream nếu cần
    };

    const handleDownloadFolder = async (slave) => {
        try {
            const res = await axios.get(`${slave.ip}/download-folder`, {
                responseType: 'blob',
            });
            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `result_from_${slave.name}.zip`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert(`❌ Download Failed: ${err.message}`);
        }
    };

    return (
        <div className="app">
            <h1>🧠 Master Control Panel</h1>

            <div className="controls">
                <button onClick={handleStartAll} disabled={loading}>
                    ▶ Start All
                </button>

                <input
                    type="file"
                    accept=".exe"
                    onChange={(e) => setFileAll(e.target.files[0])}
                />
                <button onClick={handleUploadExeToAll} disabled={loading || !fileAll}>
                    📁 Upload EXE to All
                </button>

                <button onClick={handleDeleteAll} disabled={loading}>
                    🗑 Delete EXE on All
                </button>

                <button onClick={handleStopAll} disabled={loading}>
                    🛑 Stop All
                </button>
            </div>

            <div className="controls">
                <input
                    type="text"
                    placeholder="Tên thư mục (trên D:\\)"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                />
            </div>

            <div className="grid">
                {slaves.map((slave, index) => (
                    <div className="card flex space-around" key={index}>
                        <h3>{slave.name}</h3>
                        <p>{slave.ip}</p>

                        <button onClick={() => handleStartSlave(slave)} disabled={loading}>
                            ▶ Start
                        </button>
                        <button onClick={() => handleStopSlave(slave)} disabled={loading}>
                            🛑 Stop
                        </button>
                        <button onClick={() => handleStream(slave)} disabled={loading}>
                            ▶ See more
                        </button>

                        {Object.keys(completedSlaves).length === 0 ? (
                            <p>Chưa có máy nào phản hồi</p>
                        ) : (
                            Object.entries(completedSlaves).map(([ip, isDone]) => (
                                <div key={ip} className="border p-2 mb-2 rounded shadow">
                                    <p>🖥️ IP: {ip}</p>
                                    <p>Trạng thái: {isDone ? '✅ Hoàn thành' : '⏳ Đang chạy'}</p>
                                    {isDone && (
                                        <button
                                            className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
                                            onClick={() => handleDownload(ip)}
                                        >
                                            📥 Tải kết quả
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
