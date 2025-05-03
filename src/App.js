//import React, { useEffect, useState, useRef } from 'react';
//import './App.css';
//import axios from 'axios';
//import Home from './pages/home';
//import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import CameraConfig from './pages/config';
//import { AppSidebar } from './components/sidebar';
//import FlirCapture from './components/capture';
//import Retrieve from './components/retrieve';
//import StreamView from './components/StreamViews';
//import Convert from './components/convert';

//function App() {
//    const [slaves, setSlaves] = useState([
//        {
//            name: 'Slave_12',
//            ip: '192.168.100.212',
//        },
//        //{
//        //    name: 'Slave_03',
//        //    ip: '192.168.100.203',
//        //},
//        //{
//        //    name: 'Slave_03',
//        //    ip: '192.168.100.201',
//        //},
//    ]);

//    const [sec, setSec] = useState("System");
//    const [downloadQueue, setDownloadQueue] = useState({});
//    const [completedSlaves, setCompletedSlaves] = useState([]);
//    const [convert, setConvert] = useState([]);
//    const hasToggledLiveView = useRef(false);

//    useEffect(() => {
//        const toggleLiveView = async (status = 'on') => {
//            const promises = slaves.map(slave =>
//                fetch(`http://${slave.ip}:3002/liveview?${status}`)
//                    .then(response => {
//                        if (!response.ok) {
//                            throw new Error(`HTTP error for ${slave.name}`);
//                        }
//                        console.log(`Liveview ${status} thành công với ${slave.name}`);
//                    })
//                    .catch(error => {
//                        console.error(`Error toggling liveview for ${slave.name}:`, error);
//                    })
//            );
//            await Promise.all(promises);
//        };

//        const terminateServerPy = async () => {
//            const promises = slaves.map(slave =>
//                fetch(`http://${slave.ip}:3002/terminate`, { method: 'POST' })
//                    .then(response => {
//                        if (!response.ok) {
//                            throw new Error(`Terminate error for ${slave.name}`);
//                        }
//                        console.log(`Đã terminate server.py cho ${slave.name}`);
//                    })
//                    .catch(error => {
//                        console.error(`Error terminating server.py for ${slave.name}:`, error);
//                    })
//            );
//            await Promise.all(promises);
//        };

//        if (sec === "Liveview" && !hasToggledLiveView.current) {
//            toggleLiveView('on');
//            hasToggledLiveView.current = true;
//        } else if (sec !== "Liveview" && hasToggledLiveView.current) {
//            toggleLiveView('off'); // Tắt liveview nếu cần
//            terminateServerPy();   // Gửi yêu cầu terminate server.py
//            hasToggledLiveView.current = false;
//        }
//    }, [sec, slaves]);

//    const [statuses, setStatuses] = useState({});
//    const [fileAll, setFileAll] = useState(null);
//    const [loading, setLoading] = useState(false);
//    const [folderName, setFolderName] = useState('');

//    const [isDownloading, setIsDownloading] = useState({});


//    useEffect(() => {
//        console.log('slaves: ', completedSlaves)
//    }, [completedSlaves, setCompletedSlaves])

//    useEffect(() => {
//        const interval = setInterval(() => {
//            axios.get('http://192.168.100.203:3001/completed-slaves')
//                .then((res) => {
//                    setCompletedSlaves((prev) => {
//                        return res.data.map((newItem) => {
//                            const oldItem = prev.find(item => item.ip === newItem.ip && item.folder === newItem.folder);
//                            return {
//                                ...newItem,
//                                status: oldItem?.status,
//                            };
//                        });
//                    });
//                })
//                .catch((err) => {
//                    console.error('Lỗi lấy trạng thái từ master:', err);
//                });
//        }, 5000);

//        return () => clearInterval(interval);
//    }, []);

//    const updateStatus = (ip, message) => {
//        setStatuses((prev) => ({ ...prev, [ip]: message }));
//    };

//    const handleStartSlave = async (slave) => {
//        console.log('ip', slave.ip)
//        if (!folderName) {
//            alert('Vui lòng nhập tên thư mục để lưu kết quả!');
//            return;
//        }

//        let newFolderName = `${folderName}`

//        try {
//            updateStatus(slave.ip, '▶ Starting...');
//            //await axios.post('http://localhost:3001/create-folder', { folderName });
//            const res = await axios.post(`http://${slave.ip}:3002/start`, { folderName: newFolderName });
//            updateStatus(slave.ip, `▶ ${res.data.message}`);
//        } catch (err) {
//            updateStatus(slave.ip, `❌ Failed: ${err.message}`);
//        }
//    };

//    const handleStartAll = async () => {
//        if (!slaves || slaves.length === 0) {
//            console.error('No slaves available');
//            alert('Không có slave nào để khởi động!');
//            return;
//        }

//        setLoading(true);
//        try {
//            for (const slave of slaves) {
//                console.log(`Starting slave: ${slave.ip}`);
//                await handleStartSlave(slave); // Truyền toàn bộ slave thay vì chỉ slave.ip
//            }
//        } catch (err) {
//            console.error('Error in handleStartAll:', err);
//            alert('Có lỗi xảy ra khi khởi động các slave!');
//        } finally {
//            setLoading(false);
//        }
//    };


//    const handleStopSlave = async (slave) => {
//        try {
//            updateStatus(slave.ip, '🛑 Stopping...');
//            const res = await axios.post(`${slave.ip}/stop`);
//            updateStatus(slave.ip, `🛑 ${res.data.message}`);
//        } catch (err) {
//            updateStatus(slave.ip, `❌ Stop Failed: ${err.message}`);
//        }
//    };

//    const handleUploadExeToAll = async () => {
//        if (!fileAll) {
//            alert('Vui lòng chọn file .exe!');
//            return;
//        }

//        setLoading(true);
//        for (const slave of slaves) {
//            const formData = new FormData();
//            formData.append('file', fileAll);
//            updateStatus(slave.ip, '⬆️ Uploading EXE...');

//            try {
//                const res = await axios.post(`http://${slave.ip}:3002/upload`, formData, {
//                    headers: { 'Content-Type': 'multipart/form-data' },
//                });
//                updateStatus(slave.ip, `✅ ${res.data.message}`);
//            } catch (err) {
//                updateStatus(slave.ip, `❌ Upload Failed: ${err.message}`);
//            }
//        }
//        setLoading(false);
//    };

//    const handleDeleteAll = async () => {
//        setLoading(true);
//        for (const slave of slaves) {
//            try {
//                const res = await axios.delete(`http://${slave.ip}:3002/delete`);
//                updateStatus(slave.ip, `🗑 ${res.data.message}`);
//            } catch (err) {
//                updateStatus(slave.ip, `❌ Delete Failed: ${err.message}`);
//            }
//        }
//        setLoading(false);
//    };

//    const handleStopAll = async () => {
//        setLoading(true);
//        for (const slave of slaves) {
//            await handleStopSlave(slave);
//        }
//        setLoading(false);
//    };



//    useEffect(() => {
//        // Mỗi khi hàng đợi thay đổi, kiểm tra và bắt đầu tải nếu chưa tải
//        Object.keys(downloadQueue).forEach((ip) => {
//            if (!isDownloading[ip] && downloadQueue[ip]?.length > 0) {
//                processDownloadQueue(ip);
//            }
//        });
//        console.log(downloadQueue)
//    }, [downloadQueue, setDownloadQueue]);


//    const processDownloadQueue = async (ip) => {
//        const queue = downloadQueue[ip];
//        if (!queue || queue.length === 0) return;

//        const folder = queue[0]; // lấy folder đầu tiên
//        setIsDownloading(prev => ({ ...prev, [ip]: true }));

//        updateFolderStatus(ip, folder, 'downloading');

//        try {
//            await axios.get(`http://localhost:3001/download?ip=${ip}&&folder=${folder}`);
//            console.log(ip, folder)
//            updateFolderStatus(ip, folder, 'downloaded');
//        } catch (err) {
//            updateFolderStatus(ip, folder, 'failed');
//            console.error(`Download failed for ${folder} on ${ip}`, err);
//        }

//        setDownloadQueue(prev => {
//            const newQueue = { ...prev };
//            newQueue[ip] = newQueue[ip].slice(1); // remove folder đã tải
//            return newQueue;
//        });

//        setIsDownloading(prev => ({ ...prev, [ip]: false }));
//    };

//    const updateFolderStatus = (ip, folder, status) => {
//        setConvert(prev => {
//            const folderBaseName = folder.split('_')[0];
//            // Check if an object with the base name already exists
//            if (prev.some(item => item.name === folderBaseName)) {
//                return prev; // If it exists, return the current array unchanged
//            }
//            return [...prev, {
//                name: folderBaseName,
//                status: null
//            }]; // If it doesn't exist, append new object with base name
//        });
//        setCompletedSlaves(prev => {
//            // Tạo một mảng mới thay vì sử dụng map
//            const updated = [...prev];
//            const index = updated.findIndex(item => item.ip === ip && item.folder === folder);

//            if (index !== -1) {
//                updated[index] = { ...updated[index], status };
//            }

//            return updated;
//        });
//    };


//    const handleDownload = (ip, folder) => {
//        setCompletedSlaves(prev => prev.map(item => {
//            if (item.ip === ip && item.folder === folder) {
//                return { ...item, status: 'queued' };
//            }
//            return item;
//        }));

//        setDownloadQueue(prevQueue => {
//            const newQueue = { ...prevQueue };
//            if (!newQueue[ip]) newQueue[ip] = [];
//            // Tránh trùng folder
//            if (!newQueue[ip].includes(folder)) {
//                newQueue[ip].push(folder);
//            }
//            return newQueue;
//        });
//    };


//    console.log(convert);

//    const renderContent = () => {
//        switch (sec) {
//            case "System":
//                return (
//                    <Home
//                        slaves={slaves}
//                        setSlaves={setSlaves}
//                        convert={convert}
//                        setConvert={setConvert}
//                    />
//                );
//            case "Liveview":
//                return <StreamView slaves={slaves} />;
//            case "Capture":
//                return <FlirCapture
//                    slaves={slaves}
//                    downloadQueue={downloadQueue}
//                    setDownloadQueue={setDownloadQueue}
//                    completedSlaves={completedSlaves}
//                    setCompletedSlaves={setCompletedSlaves}
//                    folderName={folderName}
//                    setFolderName={setFolderName}
//                    handleStartAll={handleStartAll}
//                    handleStartSlave={handleStartSlave}
//                    handleUploadExeToAll={handleUploadExeToAll}
//                    loading={loading}
//                    setLoading={setLoading}
//                    fileAll={fileAll}
//                    setFileAll={ setFileAll }
//                />;
//            case "Retrieve":
//                return <Retrieve />;
//            case "Convert":
//                return <Convert
//                    convert={convert}
//                    setConvert={setConvert}
//                />;
//            case "XMP+":
//                return <div>XMP+ Section (Placeholder)</div>;
//            default:
//                return <div>Please select a section</div>;
//        }
//    };

//    return (
//        <Router>
//            <div style={{ display: "flex" }}>
//                <AppSidebar sec={sec} setSec={setSec} />
//                <div style={{ marginLeft: 200, width: '100%' }}>
//                    {renderContent()}
//                </div>
//            </div>
//        </Router>
//    );
//}

//export default App;


import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import axios from 'axios';
import Home from './pages/home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CameraConfig from './pages/config';
import { AppSidebar } from './components/sidebar';
import FlirCapture from './components/capture';
import Retrieve from './components/retrieve';
import StreamView from './components/StreamViews';
import Convert from './components/convert';

function App() {
    const [slaves, setSlaves] = useState([
        {
            name: 'Slave_12',
            ip: '192.168.100.212',
        },
        // {
        //     name: 'Slave_03',
        //     ip: '192.168.100.203',
        // },
        // {
        //     name: 'Slave_03',
        //     ip: '192.168.100.201',
        // },
    ]);

    const [sec, setSec] = useState("System");
    const [downloadQueue, setDownloadQueue] = useState({});
    const [completedSlaves, setCompletedSlaves] = useState([]);
    const [convert, setConvert] = useState([]);
    const [uniqueFolders, setUniqueFolders] = useState([]);
    const hasToggledLiveView = useRef(false);

    useEffect(() => {
        const toggleLiveView = async (status = 'on') => {
            const promises = slaves.map(slave =>
                fetch(`http://${slave.ip}:3002/liveview?${status}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error for ${slave.name}`);
                        }
                        console.log(`Liveview ${status} thành công với ${slave.name}`);
                    })
                    .catch(error => {
                        console.error(`Error toggling liveview for ${slave.name}:`, error);
                    })
            );
            await Promise.all(promises);
        };

        const terminateServerPy = async () => {
            const promises = slaves.map(slave =>
                fetch(`http://${slave.ip}:3002/terminate`, { method: 'POST' })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Terminate error for ${slave.name}`);
                        }
                        console.log(`Đã terminate server.py cho ${slave.name}`);
                    })
                    .catch(error => {
                        console.error(`Error terminating server.py for ${slave.name}:`, error);
                    })
            );
            await Promise.all(promises);
        };

        if (sec === "Liveview" && !hasToggledLiveView.current) {
            toggleLiveView('on');
            hasToggledLiveView.current = true;
        } else if (sec !== "Liveview" && hasToggledLiveView.current) {
            toggleLiveView('off');
            terminateServerPy();
            hasToggledLiveView.current = false;
        }
    }, [sec, slaves]);

    const [statuses, setStatuses] = useState({});
    const [fileAll, setFileAll] = useState(null);
    const [loading, setLoading] = useState(false);
    const [folderName, setFolderName] = useState('');

    const [isDownloading, setIsDownloading] = useState({});

    useEffect(() => {
        console.log('slaves: ', completedSlaves);
        console.log('uniqueFolders: ', uniqueFolders)
    }, [completedSlaves, setCompletedSlaves, uniqueFolders, setUniqueFolders]);

    useEffect(() => {
        const interval = setInterval(() => {
            axios.get('http://192.168.100.203:3001/completed-slaves')
                .then((res) => {
                    setCompletedSlaves((prev) => {
                        return res.data.map((newItem) => {
                            const oldItem = prev.find(item => item.ip === newItem.ip && item.folder === newItem.folder);
                            return {
                                ...newItem,
                                status: oldItem?.status,
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

    useEffect(() => {
        setUniqueFolders(() => {
            const folderMap = {};
            completedSlaves.forEach(item => {
                const folderBaseName = item.folder;
                if (!folderMap[folderBaseName]) {
                    folderMap[folderBaseName] = {
                        folder: folderBaseName,
                        status: item.status || '' // Use the status from the item, default to empty string
                    };
                }
            });

            // Ensure current folder is included
            const currentFolderBaseName = folderName;
            if (!folderMap[currentFolderBaseName]) {
                folderMap[currentFolderBaseName] = {
                    folder: currentFolderBaseName,
                    status: ''
                };
            }

            return Object.values(folderMap);
        });
    }, [completedSlaves, folderName]);

    const updateStatus = (ip, message) => {
        setStatuses((prev) => ({ ...prev, [ip]: message }));
    };

    const handleStartSlave = async (slave) => {
        console.log('ip', slave.ip);
        if (!folderName) {
            alert('Vui lòng nhập tên thư mục để lưu kết quả!');
            return;
        }

        let newFolderName = `${folderName}`;

        try {
            updateStatus(slave.ip, '▶ Starting...');
            const res = await axios.post(`http://${slave.ip}:3002/start`, { folderName: newFolderName });
            updateStatus(slave.ip, `▶ ${res.data.message}`);
        } catch (err) {
            updateStatus(slave.ip, `❌ Failed: ${err.message}`);
        }
    };

    const handleStartAll = async () => {
        if (!slaves || slaves.length === 0) {
            console.error('No slaves available');
            alert('Không có slave nào để khởi động!');
            return;
        }

        setLoading(true);
        try {
            for (const slave of slaves) {
                console.log(`Starting slave: ${slave.ip}`);
                await handleStartSlave(slave);
            }
        } catch (err) {
            console.error('Error in handleStartAll:', err);
            alert('Có lỗi xảy ra khi khởi động các slave!');
        } finally {
            setLoading(false);
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

    useEffect(() => {
        Object.keys(downloadQueue).forEach((ip) => {
            if (!isDownloading[ip] && downloadQueue[ip]?.length > 0) {
                processDownloadQueue(ip);
            }
        });
        console.log(downloadQueue);
    }, [downloadQueue, setDownloadQueue]);

    const processDownloadQueue = async (ip) => {
        const queue = downloadQueue[ip];
        if (!queue || queue.length === 0) return;

        const folder = queue[0];
        setIsDownloading(prev => ({ ...prev, [ip]: true }));

        updateFolderStatus(ip, folder, 'downloading');

        try {
            await axios.get(`http://localhost:3001/download?ip=${ip}&folder=${folder}`);
            console.log(ip, folder);
            updateFolderStatus(ip, folder, 'downloaded');
        } catch (err) {
            updateFolderStatus(ip, folder, 'failed');
            console.error(`Download failed for ${folder} on ${ip}`, err);
        }

        setDownloadQueue(prev => {
            const newQueue = { ...prev };
            newQueue[ip] = newQueue[ip].slice(1);
            return newQueue;
        });

        setIsDownloading(prev => ({ ...prev, [ip]: false }));
    };

    const updateFolderStatus = (ip, folder, status) => {
        // Cập nhật completedSlaves
        setCompletedSlaves(prev => {
            const updated = [...prev];
            const index = updated.findIndex(item => item.ip === ip && item.folder === folder);

            if (index !== -1) {
                updated[index] = { ...updated[index], status };
            }

            return updated;
        });

        // Cập nhật uniqueFolders từ completedSlaves, loại bỏ folder trùng
       
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
            if (!newQueue[ip].includes(folder)) {
                newQueue[ip].push(folder);
            }
            return newQueue;
        });
    };

    const renderContent = () => {
        switch (sec) {
            case "System":
                return (
                    <Home
                        slaves={slaves}
                        setSlaves={setSlaves}
                        convert={convert}
                        setConvert={setConvert}
                        uniqueFolders={uniqueFolders}
                    />
                );
            case "Liveview":
                return <StreamView slaves={slaves} />;
            case "Capture":
                return <FlirCapture
                    uniqueFolders={uniqueFolders }
                    slaves={slaves}
                    handleDownload={ handleDownload }
                    downloadQueue={downloadQueue}
                    setDownloadQueue={setDownloadQueue}
                    completedSlaves={completedSlaves}
                    setCompletedSlaves={setCompletedSlaves}
                    folderName={folderName}
                    setFolderName={setFolderName}
                    handleStartAll={handleStartAll}
                    handleStartSlave={handleStartSlave}
                    handleUploadExeToAll={handleUploadExeToAll}
                    loading={loading}
                    setLoading={setLoading}
                    fileAll={fileAll}
                    setFileAll={setFileAll}
                />;
            case "Retrieve":
                return <Retrieve />;
            case "Convert":
                return <Convert
                    convert={convert}
                    setConvert={setConvert}
                    uniqueFolders={uniqueFolders}
                />;
            case "XMP+":
                return <div>XMP+ Section (Placeholder)</div>;
            default:
                return <div>Please select a section</div>;
        }
    };

    return (
        <Router>
            <div style={{ display: "flex" }}>
                <AppSidebar sec={sec} setSec={setSec} />
                <div style={{ marginLeft: 200, width: '100%' }}>
                    {renderContent()}
                </div>
            </div>
        </Router>
    );
}

export default App;