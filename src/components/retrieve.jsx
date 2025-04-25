import { Settings, Download, X } from "lucide-react"
import { useState } from "react"
import "../assets/retrieve.css" // Đừng quên import file CSS

export default function Retrieve() {
    const [takeName, setTakeName] = useState("Volumetric_Capture_Take1")
    const [progress, setProgress] = useState(55)

    const recordedTakes = [
        "Volumetric_Capture_Take1",
        "Volumetric_Capture_Take2",
        "Volumetric_Capture_Take3",
        "Volumetric_Capture_Take4",
        "Volumetric_Capture_Take5",
        "Volumetric_Capture_TakeCalibration",
        "Volumetric_Capture_Take6",
    ]

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
                        <div className="take-list">
                            {recordedTakes.map((take, index) => (
                                <div key={index} className="take-item">
                                    {index + 1}. {take}
                                </div>
                            ))}
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
