import React, { useState } from "react";
import { FaCamera } from "react-icons/fa";
import '../assets/config.css';
import { useSearchParams } from "react-router-dom";

const CameraConfig = () => {
    const [searchParams] = useSearchParams();
    const ip = searchParams.get('ip');
   

    const [exposureTime, setExposureTime] = useState(10003);
    const [gain, setGain] = useState(2);
    const [gamma, setGamma] = useState(0.7);
    const [blackLevel, setBlackLevel] = useState(3);
    const [balanceRatioRed, setBalanceRatioRed] = useState(1.25);
    const [balanceRatioBlue, setBalanceRatioBlue] = useState(1.25);
    //const [lutEnabled, setLutEnabled] = useState(true);

    const handleSaveConfig = async () => {
        const configText = `[CameraSettings]
ExposureTime=${exposureTime}
Gain=${gain}
Gamma=${gamma}
BlackLevel=${blackLevel}
BalanceRatioRed=${balanceRatioRed.toFixed(2)}
BalanceRatioBlue=${balanceRatioBlue.toFixed(2)}
`;

        try {
            const response = await fetch(`http://${ip}:3002/upload-configfile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: configText }),
            });

            const result = await response.json();
            alert(result.message);
        } catch (err) {
            console.error('Lỗi khi gửi config:', err);
        }
    };


    return (
        <div className="camera-config">
            <div className="header">
                <FaCamera />
                <span>Camera Configuration</span>
            </div>

            <div className="inputs">
                <label className="input-label">
                    Exposure Time: {exposureTime} µs
                </label>
                <input
                    type="range"
                    min={0}
                    max={20000}
                    value={exposureTime}
                    onChange={(e) => setExposureTime(Number(e.target.value))}
                    className="input-range"
                />

                <label className="input-label">
                    Gain: {gain} dB
                </label>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={gain}
                    onChange={(e) => setGain(Number(e.target.value))}
                    className="input-range"
                />

                <label className="input-label">
                    Gamma: {gamma.toFixed(2)}
                </label>
                <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.01}
                    value={gamma}
                    onChange={(e) => setGamma(Number(e.target.value))}
                    className="input-range"
                />

                <label className="input-label">
                    Black Level: {blackLevel}%
                </label>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={blackLevel}
                    onChange={(e) => setBlackLevel(Number(e.target.value))}
                    className="input-range"
                />

                <label className="input-label">
                    Balance Ratio Red: {balanceRatioRed.toFixed(2)}
                </label>
                <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.01}
                    value={balanceRatioRed}
                    onChange={(e) => setBalanceRatioRed(Number(e.target.value))}
                    className="input-range"
                />

                <label className="input-label">
                    Balance Ratio Blue: {balanceRatioBlue.toFixed(2)}
                </label>
                <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.01}
                    value={balanceRatioBlue}
                    onChange={(e) => setBalanceRatioBlue(Number(e.target.value))}
                    className="input-range"
                />

                <button className="save-button" onClick={handleSaveConfig}>
                    OK
                </button>
            </div>
        </div>
    );
};

export default CameraConfig;
