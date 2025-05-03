import { Settings, Download, X } from "lucide-react"
import { useState } from "react"
import "../assets/retrieve.css" // Đừng quên import file CSS

export default function Retrieve() {
    const [takeName, setTakeName] = useState("Chọn thư mục")
    const [progress, setProgress] = useState(55)

    const handleFolderClick = (folderName) => {
        setTakeName(folderName);
    };

    // Function to handle deleting a folder from convert array
    const handleDelete = (folderName) => {
        //setConvert(prev => prev.filter(item => item.name !== folderName));
        return 1
    };

    

    return (
        <div className="container">
            {/* Header */}
            <div className="header">
                <div className="title">
                    FLIR Capture
                    <div className="subtitle">by 4DSCANLAB</div>
                </div>
                <button className="icon-button">
                    <Settings size={24} />
                </button>
            </div>

            <div className="grid">
                <div className="left-panel">
                    {/* Take Name Input */}
                    <div className="input-group">
                        <label className="label">take:</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={takeName}
                                onChange={(e) => setTakeName(e.target.value)}
                                className="input"
                                placeholder="Enter take name to start recording"
                            />
                            <button className="clear-button" onClick={() => setTakeName("")}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="hint">Enter take name to start recording</div>
                    </div>

                    {/* Retrieve Files Button */}
                    <div className="centered">
                        <button className="retrieve-button">
                            <Download size={16} />
                            <span>RETRIEVE FILES</span>
                        </button>
                    </div>

                    {/* Recording Status */}
                    <div className="card">
                        <div className="card-title">Recording Status</div>
                        <div className="card-desc">Supporting line text lorem ipsum dolor sit amet, consectetur.</div>
                    </div>

                    {/* Recorded Takes */}
                    <div className="takes-box">
                        <div className="card-title">Recorded Takes</div>
                        <div className="takes-container">
                            <div className="takes-title">CONVERT TAKES</div>
                            <table className="take-list" style={{width: '100%'} }>
                                <tbody>
                                    {[1,2,3].map((item, index) => (
                                        <tr key={index}>
                                            <td
                                                className="folder-name"
                                                onClick={() => handleFolderClick(item.name)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {item.name || 'test'}
                                            </td>
                                            <td style={{ textAlign: 'right' }} >{item.status || "waiting"}</td>
                                            <td style={{textAlign: 'right'} }>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDelete(item.name)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Progress Circle */}
                <div className="progress-container">
                    <div className="progress-wrapper">
                        <svg viewBox="0 0 100 100" className="progress-svg">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="2" />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeDasharray={2 * Math.PI * 45}
                                strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="progress-label">
                            <span>{progress}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
