import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const Home = ({
    slaves,
    setSlaves,
    downloadQueue,
    setDownloadQueue,
    completedSlaves,
    setCompletedSlaves,
    convert,
    setConvert,
    handleStartSlave,
    handleStopSlave,
    handleStream,
    handleDownload
}) => {
    const navigate = useNavigate();
    const [editingIp, setEditingIp] = useState(null);
    const [newIp, setNewIp] = useState('');

    const startEditingIp = (slave) => {
        setEditingIp(slave.name);
        setNewIp(slave.ip);
    };

    const saveNewIp = (slave) => {
        setSlaves(prev =>
            prev.map(s =>
                s.name === slave.name ? { ...s, ip: newIp } : s
            )
        );
        setEditingIp(null);
    };

    const handleIpChange = (value) => setNewIp(value);
    const handleIpBlur = (slave) => saveNewIp(slave);
    const handleIpKeyPress = (e, slave) => {
        if (e.key === 'Enter') saveNewIp(slave);
        else if (e.key === 'Escape') setEditingIp(null);
    };

    return (
        <div className="app">
            <style>{`
        .app {
          background-color: #1a1a1a;
          color: #ffffff;
          min-height: 100vh;
          width: 100%;
          font-family: 'Arial', sans-serif;
        }
        h1 {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 32px;
          color: #ffffff;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding: 1rem;
        }
        .card {
          background: #000;
          border: 1px solid #fff;
          border-radius: 8px;
          padding: 1rem;
        }
        .card input[type="text"] {
          padding: 8px;
          border: 1px solid #444;
          border-radius: 6px;
          background-color: #3a3a3a;
          color: #fff;
          width: 100%;
        }
        .card-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 1rem;
        }
        .card-buttons button {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          color: #fff;
        }
        .btn-start { background-color: #22c55e; }
        .btn-stop { background-color: #ef4444; }
        .btn-stream { background-color: #3b82f6; }
        .btn-download { background-color: #10b981; }
        .btn-delete { background-color: #f87171; }
        .card-buttons button:hover {
          opacity: 0.9;
        }
      `}</style>

            <h1>🧠 Master Control Panel</h1>

            <div className="grid">
                {slaves.map((slave, index) => {
                    //const folderList = completedSlaves.filter(item => item.ip === slave.ip && item.done);

                    return (
                        <div className="card" key={index}>
                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr>
                                        <td><strong>{slave.name}</strong></td>
                                        <td style={{ textAlign: 'right' }}>
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
                                                <p onClick={() => startEditingIp(slave)} style={{ cursor: 'pointer', margin: 0 }}>
                                                    {slave.ip}
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>CPU|RAM|NVME|ETH</td>
                                        <td style={{ textAlign: 'right' }}>12|14|16|1000</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/*<div className="card-buttons">*/}
                            {/*    <button className="btn-start" onClick={() => handleStartSlave(slave)}>Start</button>*/}
                            {/*    <button className="btn-stop" onClick={() => handleStopSlave(slave)}>Stop</button>*/}
                            {/*    <button className="btn-stream" onClick={() => handleStream(slave)}>Stream</button>*/}
                            {/*</div>*/}

                            {/*{folderList.map((item, idx) => (*/}
                            {/*    <div key={idx} className="card-buttons" style={{ marginTop: '8px' }}>*/}
                            {/*        <span style={{ flex: 1, color: '#ccc' }}>{item.folder}</span>*/}
                            {/*        <input*/}
                            {/*            type="checkbox"*/}
                            {/*            checked={item.state === 'downloaded'}*/}
                            {/*            readOnly*/}
                            {/*        />*/}
                            {/*        <button*/}
                            {/*            className="btn-download"*/}
                            {/*            onClick={() => handleDownload(item)}*/}
                            {/*            disabled={item.status === 'downloading' || item.state === 'downloaded'}*/}
                            {/*        >*/}
                            {/*            📥*/}
                            {/*        </button>*/}
                            {/*        <button*/}
                            {/*            className="btn-delete"*/}
                            {/*            onClick={() => {*/}
                            {/*                setCompletedSlaves(prev => prev.filter(f => !(f.ip === item.ip && f.folder === item.folder)));*/}
                            {/*            }}*/}
                            {/*        >*/}
                            {/*            ❌*/}
                            {/*        </button>*/}
                            {/*    </div>*/}
                            {/*))}*/}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Home;
