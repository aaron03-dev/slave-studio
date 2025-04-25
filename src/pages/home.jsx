import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Define the props for the Home component (using TypeScript-like syntax in JSX comments for clarity)
/* 
const Slave = {
  name: String,
  ip: String,
};

const FolderItem = {
  ip: String,
  folder: String,
  done: Boolean,
  status: String, // 'downloading' | 'downloaded' | null
  state: String, // Optional, as used in the checkbox
};

const HomeProps = {
  handleStartAll: Function,
  handleUploadExeToAll: Function,
  handleDeleteAll: Function,
  handleStopAll: Function,
  setFileAll: Function,
  fileAll: File | null,
  loading: Boolean,
  folderName: String,
  setFolderName: Function,
  slaves: Array<Slave>,
  setSlaves: Function,
  completedSlaves: Array<FolderItem>,
  handleStartSlave: Function,
  handleStopSlave: Function,
  handleStream: Function,
  handleDownload: Function,
  updateFolderStatus: Function,
};
*/

const Home = ({
    slaves,
    setSlaves
}) => {
    const navigate = useNavigate();
    const [editingIp, setEditingIp] = useState(null); // Track which slave's IP is being edited
    const [newIp, setNewIp] = useState(''); // Temporary state for the new IP value
    const [statuses, setStatuses] = useState({});
    const [fileAll, setFileAll] = useState(null);
    const [loading, setLoading] = useState(false);
    const [folderName, setFolderName] = useState('');

    const [downloadQueue, setDownloadQueue] = useState({});
    const [isDownloading, setIsDownloading] = useState({});

    const [completedSlaves, setCompletedSlaves] = useState([]);


    useEffect(() => {
        const interval = setInterval(() => {
            axios.get('http://192.168.100.203:3001/completed-slaves')
                .then((res) => {
                    setCompletedSlaves((prev) => {
                        return res.data.map((newItem) => {
                            const oldItem = prev.find(item => item.ip === newItem.ip && item.folder === newItem.folder);
                            return {
                                ...newItem,
                                status: oldItem?.status || 'waiting',
                            };
                        });
                    });
                })
                .catch((err) => {
                    console.error('Lỗi lấy trạng thái từ master:', err);
                });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const updateStatus = (ip, message) => {
        setStatuses((prev) => ({ ...prev, [ip]: message }));
    };

    const handleStartSlave = async (slave) => {
        if (!folderName) {
            alert('Vui lòng nhập tên thư mục để lưu kết quả!');
            return;
        }

        let newFolderName = `${folderName}_${slave.name}`
        console.log(newFolderName)

        try {
            updateStatus(slave.ip, '▶ Starting...');
            const res = await axios.post(`http://${slave.ip}:3002/start`, { folderName: newFolderName });
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
                const res = await axios.post(`http://${slave.ip}:3002/upload`, formData, {
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
                const res = await axios.delete(`http://${slave.ip}:3002/delete`);
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
        window.open('http://192.168.100.212:5000/'); // Tuỳ chỉnh link stream nếu cần
    };

    useEffect(() => {
        // Mỗi khi hàng đợi thay đổi, kiểm tra và bắt đầu tải nếu chưa tải
        Object.keys(downloadQueue).forEach((ip) => {
            if (!isDownloading[ip] && downloadQueue[ip]?.length > 0) {
                processDownloadQueue(ip);
            }
        });
        console.log(downloadQueue)
    }, [downloadQueue, setDownloadQueue]);

    useEffect(() => {
        console.log('📦 completedSlaves updated:', completedSlaves);
    }, [completedSlaves]);

    const processDownloadQueue = async (ip) => {
        const queue = downloadQueue[ip];
        if (!queue || queue.length === 0) return;

        const folder = queue[0]; // lấy folder đầu tiên
        setIsDownloading(prev => ({ ...prev, [ip]: true }));

        updateFolderStatus(ip, folder, 'downloading');

        try {
            await axios.get(`http://localhost:3001/download?ip=${ip}&&folder=${folder}`);
            console.log(ip, folder)
            updateFolderStatus(ip, folder, 'downloaded');
        } catch (err) {
            updateFolderStatus(ip, folder, 'failed');
            console.error(`Download failed for ${folder} on ${ip}`, err);
        }

        setDownloadQueue(prev => {
            const newQueue = { ...prev };
            newQueue[ip] = newQueue[ip].slice(1); // remove folder đã tải
            return newQueue;
        });

        setIsDownloading(prev => ({ ...prev, [ip]: false }));
    };

    const updateFolderStatus = (ip, folder, status) => {
        setCompletedSlaves(prev => {
            // Tạo một mảng mới thay vì sử dụng map
            const updated = [...prev];
            const index = updated.findIndex(item => item.ip === ip && item.folder === folder);

            if (index !== -1) {
                updated[index] = { ...updated[index], status };
            }

            return updated;
        });
    };


    const handleDownload = (ip, folder) => {
        setCompletedSlaves(prev => prev.map(item => {
            if (item.ip === ip && item.folder === folder) {
                return { ...item, status: 'queued' };
            }
            return item;
        }));

        setDownloadQueue(prevQueue => {
            const newQueue = { ...prevQueue };
            if (!newQueue[ip]) newQueue[ip] = [];
            // Tránh trùng folder
            if (!newQueue[ip].includes(folder)) {
                newQueue[ip].push(folder);
            }
            return newQueue;
        });
    };
    const handleNavigate = (ip) => {
        navigate(`/config-camera?ip=${ip}`);
    };

    // Handlers for IP editing
    const startEditingIp = (slave) => {
        setEditingIp(slave.name); // Use name as a unique identifier
        setNewIp(slave.ip); // Pre-fill the input with the current IP
    };

    const saveNewIp = (slave) => {
        setSlaves(prev =>
            prev.map(s =>
                s.name === slave.name ? { ...s, ip: newIp } : s
            )
        );
        setEditingIp(null); // Exit editing mode
    };

    const handleIpChange = (value) => {
        setNewIp(value);
    };

    const handleIpBlur = (slave) => {
        saveNewIp(slave); // Save when the input loses focus
    };

    const handleIpKeyPress = (e, slave) => {
        if (e.key === 'Enter') {
            saveNewIp(slave); // Save when Enter is pressed
        } else if (e.key === 'Escape') {
            setEditingIp(null); // Cancel editing
        }
    };

    return (
        <div className="app">
            <style>{`
        .app {
          background-color: #1a1a1a;
          color: #ffffff;
          min-height: 100vh;
          padding: 24px;
          font-family: 'Arial', sans-serif;
        }

        .app h1 {
          font-size: 2.5rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 32px;
          color: #ffffff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-bottom: 24px;
        }

        .controls input[type="text"],
        .controls input[type="file"] {
          padding: 12px;
          border: 1px solid #444;
          border-radius: 8px;
          background-color: #2a2a2a;
          color: #ffffff;
          font-size: 1rem;
          width: 220px;
          transition: border-color 0.3s;
        }

        .controls input[type="text"]::placeholder {
          color: #888;
        }

        .controls input[type="text"]:focus,
        .controls input[type="file"]:focus {
          border-color: #3b82f6;
          outline: none;
        }

        .controls button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          background-color: #3b82f6;
          color: #ffffff;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.1s;
        }

        .controls button:disabled {
          background-color: #666;
          cursor: not-allowed;
        }

        .controls button:hover:not(:disabled) {
          background-color: #2563eb;
          transform: translateY(-1px);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .card {
          background-color: #2a2a2a;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s;
        }

        .card:hover {
          transform: translateY(-4px);
        }

        .card h3 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 8px;
          color: #ffffff;
        }

        .card p {
          font-size: 1rem;
          color: #3b82f6;
          cursor: pointer;
          transition: color 0.2s;
        }

        .card p:hover {
          color: #60a5fa;
          text-decoration: underline;
        }

        .card input[type="text"] {
          padding: 8px;
          border: 1px solid #444;
          border-radius: 6px;
          background-color: #3a3a3a;
          color: #ffffff;
          width: 100%;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .card input[type="text"]:focus {
          border-color: #3b82f6;
          outline: none;
        }

        .card-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 16px;
        }

        .card-buttons button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.1s;
        }

        .card-buttons button:disabled {
          background-color: #666;
          cursor: not-allowed;
        }

        .card-buttons button:not(:disabled):hover {
          transform: translateY(-1px);
        }

        .btn-start {
          background-color: #22c55e;
        }

        .btn-start:hover:not(:disabled) {
          background-color: #16a34a;
        }

        .btn-stop {
          background-color: #ef4444;
        }

        .btn-stop:hover:not(:disabled) {
          background-color: #dc2626;
        }

        .btn-stream {
          background-color: #3b82f6;
        }

        .btn-stream:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .btn-config {
          background-color: #f59e0b;
        }

        .btn-config:hover:not(:disabled) {
          background-color: #d97706;
        }

        .folder-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          padding: 12px;
          background-color: #3a3a3a;
          border-radius: 8px;
          transition: background-color 0.3s;
        }

        .folder-item:hover {
          background-color: #444;
        }

        .folder-item input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #22c55e;
        }

        .folder-item span {
          flex: 1;
          font-size: 0.9rem;
          color: #d1d5db;
        }

        .folder-item button {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .btn-download {
          background-color: #3b82f6;
          color: #ffffff;
        }

        .btn-download:disabled {
          background-color: #666;
        }

        .btn-download:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .btn-delete {
          background-color: #ef4444;
          color: #ffffff;
        }

        .btn-delete:hover {
          background-color: #dc2626;
        }
      `}</style>

            <div className="app">
                <h1>🧠 Master Control Panel</h1>

                <div className="controls">
                    <button onClick={handleStartAll} disabled={loading}>
                        ▶ Start All
                    </button>

                    <input
                        type="file"
                        accept=".exe"
                        onChange={(e) => setFileAll(e.target.files ? e.target.files[0] : null)}
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
                    {slaves.map((slave, index) => {
                        // Lọc ra tất cả các item có IP trùng với slave
                        const completedList = completedSlaves.filter(item => item.ip === slave.ip && item.done);

                        return (
                            <div className="card" key={index}>
                                <div>
                                    <h3>{slave.name}</h3>
                                    {editingIp === slave.name ? (
                                        <input
                                            type="text"
                                            value={newIp}
                                            onChange={(e) => handleIpChange(e.target.value)}
                                            onBlur={() => handleIpBlur(slave)}
                                            onKeyDown={(e) => handleIpKeyPress(e, slave)}
                                            autoFocus
                                        />
                                    ) : (
                                        <p onClick={() => startEditingIp(slave)}>
                                            {slave.ip}
                                        </p>
                                    )}
                                </div>

                                <div className="card-buttons">
                                    <button
                                        className="btn-start"
                                        onClick={() => handleStartSlave(slave)}
                                        disabled={loading}
                                    >
                                        ▶ Start
                                    </button>
                                    <button
                                        className="btn-stop"
                                        onClick={() => handleStopSlave(slave)}
                                        disabled={loading}
                                    >
                                        🛑 Stop
                                    </button>
                                    <button
                                        className="btn-stream"
                                        onClick={() => handleStream(slave)}
                                        disabled={loading}
                                    >
                                        ▶ See more
                                    </button>
                                    <button
                                        className="btn-config"
                                        onClick={() => handleNavigate(slave.ip)}
                                        disabled={loading}
                                    >
                                        Config
                                    </button>
                                </div>

                                {completedList.length > 0 && completedList.map((item, i) => (
                                    <div key={i} className="folder-item">
                                        <input
                                            type="checkbox"
                                            checked={item.status === "downloaded"}
                                            readOnly
                                        />
                                        <span>
                                            📁 {item.folder}
                                        </span>
                                        <button
                                            className="btn-download"
                                            onClick={() => handleDownload(item.ip, item.folder)}
                                            disabled={item.status === 'downloading' || item.status === 'downloaded'}
                                        >
                                            {item.status === 'downloading' ? '⏳' : '📥'}
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => updateFolderStatus(item.ip, item.folder, null)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Home;