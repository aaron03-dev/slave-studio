"use client"

import { useState } from "react"
import "../assets/convert.css"

export default function Convert({
    convert,
    setConvert
}) {
    const [takeName, setTakeName] = useState("Chọn thư mục")
    const [progress, setProgress] = useState(65)

    // Function to handle clicking a folder name
    const handleFolderClick = (folderName) => {
        setTakeName(folderName);
    };

    // Function to handle deleting a folder from convert array
    const handleDelete = (folderName) => {
        setConvert(prev => prev.filter(item => item.name !== folderName));
    };

    // Function to handle Convert button click
    const handleConvert = async () => {
        try {
            // Make API call to localhost:3001/convert
            const response = await fetch('http://localhost:3001/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileName: takeName }),
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const { status } = data; // Assuming server returns { status: "some_status" }

            // Update status in convert array
            setConvert(prev => {
                const updated = [...prev];
                const index = updated.findIndex(item => item.name === takeName);
                if (index !== -1) {
                    updated[index] = { ...updated[index], status };
                } else {
                    // If takeName is not in convert, add it with the status
                    updated.push({ name: takeName, status });
                }
                return updated;
            });

        } catch (error) {
            console.error('Error calling convert API:', error);
            // Optionally update status to indicate error
            setConvert(prev => {
                const updated = [...prev];
                const index = updated.findIndex(item => item.name === takeName);
                if (index !== -1) {
                    updated[index] = { ...updated[index], status: 'Error' };
                } else {
                    updated.push({ name: takeName, status: 'Error' });
                }
                return updated;
            });
        }
    };

    return (
        <div className="app-container">
            <div className="app-content">
                {/* Left Panel */}
                <div className="left-panel">
                    {/* Take Input */}
                    <div className="input-container">
                        <input
                            className="take-input"
                            value={takeName}
                            onChange={(e) => setTakeName(e.target.value)}
                        />
                        <button className="clear-button" onClick={() => setTakeName("")}>
                            X
                        </button>
                    </div>
                    <div className="input-hint">Enter take name to START recording</div>

                    {/* Recording Status */}
                    <div className="status-container">
                        <div className="status-title">RECORDING STATUS</div>
                        <div className="status-text">Supporting line text lorem ipsum dolor sit amet, consectetur.</div>
                    </div>

                    {/* Convert Table */}
                    <div className="takes-container">
                        <div className="takes-title">CONVERT TAKES</div>
                        <table className="convert-table">
                            <tbody>
                                {convert.map((item, index) => (
                                    <tr key={index}>
                                        <td
                                            className="folder-name"
                                            onClick={() => handleFolderClick(item.name)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            {item.name}
                                        </td>
                                        <td>{item.status || "N/A"}</td>
                                        <td>
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

                {/* Center - Convert Button */}
                <div className="center-panel">
                    <div className="convert-button" onClick={handleConvert}>
                        <div className="icon-container">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                <line x1="9" y1="9" x2="9.01" y2="9" />
                                <line x1="15" y1="9" x2="15.01" y2="9" />
                            </svg>
                        </div>
                        <div className="convert-text">CONVERT</div>
                        <div className="convert-text">FILES</div>
                    </div>
                </div>

                {/* Right - Progress Circle */}
                <div className="right-panel">
                    <div className="progress-container">
                        {/* Outer circle */}
                        <div className="outer-circle"></div>

                        {/* Progress indicator */}
                        <svg className="progress-svg" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="46"
                                fill="transparent"
                                stroke="red"
                                strokeWidth="8"
                                strokeDasharray={`${progress * 2.89} ${(100 - progress) * 2.89}`}
                                strokeLinecap="round"
                            />
                        </svg>

                        {/* Percentage display */}
                        <div className="percentage-display">
                            <span>{progress}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}