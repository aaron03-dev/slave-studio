import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const slaves = [
    {
        name: 'Slave_12',
        ip: 'http://192.168.100.212:3002', // Sửa IP theo thực tế
    },
];

function App() {
    const [statuses, setStatuses] = useState({});
    const [fileAll, setFileAll] = useState(null);
    const [loading, setLoading] = useState(false);
    const [folderName, setFolderName] = useState('');

    const [downloadQueue, setDownloadQueue] = useState({});
    const [isDownloading, setIsDownloading] = useState({});


    const [completedSlaves, setCompletedSlaves] = useState([]);

    //useEffect(() => {



    //    const interval = setInterval(() => {
    //        axios.get('http://192.168.100.203:3001/completed-slaves')
    //            .then((res) => {
    //                setCompletedSlaves(res.data);
    //            })
    //            .catch((err) => {
    //                console.error('Lỗi lấy trạng thái từ master:', err);
    //            });
    //    }, 3000); // polling mỗi 3 giây

    //    return () => clearInterval(interval); // clear khi component unmount
    //}, []);

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


    //const handleDownload = (ip) => {
    //    window.open(`http://localhost:3001/download?ip=${ip}`, '_blank');
    //};

    

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
            const res = await axios.post(`${slave.ip}/start`, { folderName: newFolderName });
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
    }, [downloadQueue]);

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

    //const updateFolderStatus = (ip, folder, status) => {
    //    setCompletedSlaves(prev => prev.map(item => {
    //        if (item.ip === ip && item.folder === folder) {
    //            return { ...item, status };
    //        }
    //        return item;
    //    }));
    //};

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
                {slaves.map((slave, index) => {
                    // Lọc ra tất cả các item có IP trùng với slave
                    const completedList = completedSlaves.filter(item => item.ip === slave.ip && item.done);

                    return (
                        <div className="card flex flex-col gap-2 p-4 border mb-4" key={index}>
                            <div>
                                <h3>{slave.name}</h3>
                                <p>{slave.ip}</p>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => handleStartSlave(slave)} disabled={loading}>
                                    ▶ Start
                                </button>
                                <button onClick={() => handleStopSlave(slave)} disabled={loading}>
                                    🛑 Stop
                                </button>
                                <button onClick={() => handleStream(slave)} disabled={loading}>
                                    ▶ See more
                                </button>
                            </div>

                            {completedList.length > 0 && completedList.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 mt-2 border p-2 rounded">
                                    <input
                                        type="checkbox"
                                        className={`w-4 h-4 ${item.state === "downloaded" ? 'checkbox-green' : ''}`}
                                        checked={item.status === "downloaded"}
                                        readOnly
                                    />
                                    <span className="text-sm text-gray-700">
                                        📁 {item.folder}
                                
                                    </span>
                                    <button
                                        className={`text-white px-3 py-1 rounded ${item.status === 'downloading' ? 'bg-gray-400' : 'bg-blue-500'}`}
                                        onClick={() => handleDownload(item.ip, item.folder)}
                                        disabled={item.status === 'downloading' || item.status === 'downloaded'}
                                    >
                                        {item.status === 'downloading' ? '⏳' : '📥'}
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-3 py-1 rounded"
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
    );
}

export default App;
