
import React from "react";
import "../assets/capture.css"

const FlirCapture = ({
    uniqueFolders,
    slaves,
    handleDownload,
    downloadQueue,
    setDownloadQueue,
    completedSlaves,
    setCompletedSlaves,
    folderName,
    setFolderName,
    handleStartAll,
    handleStartSlave,
    handleUploadExeToAll,
    loading,
    setLoading,
    fileAll,
    setFileAll,
}) => {
    return (
        <div className="dashboard">
            <div className="header">
                <h2>FLIR Capture <span className="brand">by 4DSCANLAB</span></h2>
                <div className="settings-icon">⚙️</div>
            </div>

            <div className="controls">
                <button className="btn arm">📡 ARM ALL CAMERAS</button>
                <button onClick={handleStartAll} className="btn start">▶ START RECORD</button>
                <button className="btn stop">📷 CANCEL / STOP REC</button>
            </div>

            <div className="input-section">
                <input
                    type="text"
                    className="take-input"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                />
                <span className="clear-btn">❌</span>
                <p className="input-help">Enter take name to start recording</p>
            </div>

            <div className="status-box">
                <h4>RECORDING STATUS</h4>
                <p>Supporting line text lorem ipsum dolor sit amet, consectetur.</p>
            </div>

            <div className="content">
                <div className="takes">
                    <h4>RECORDED TAKES</h4>
                    <table className="take-list" style={{ width: '100%' }}>
                        <tbody>
                            {uniqueFolders.map((item, index) => (
                                <tr key={index}>
                                    <td
                                        className="folder-name"
                                    >
                                        {item.folder}
                                    </td>
                                    <td style={{ textAlign: 'right' }} >{item.status || "waiting"}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDownload(item)}
                                            className="download-button"
                                        >
                                            📥
                                        </button>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            className="del-button"
                                        >
                                            ❌
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="slaves">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="slave-box">
                            <p>SLAVE {String(i + 1).padStart(2, "0")}</p>
                            <span>RAM LOAD</span>
                            <strong>80</strong>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FlirCapture;

