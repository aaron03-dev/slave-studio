import React, { useState, useEffect } from 'react';
import '../assets/streamviews.css';

//const generateCameraFeeds = (slaves) => {
//    const feeds = [];
//    const slaveCount = 12;
//    const camerasPerSlave = 5;

//        for (let cam = 0; cam < camerasPerSlave; cam++) {
//    for (let slave = 1; slave <= slaveCount; slave++) {
//            const randomId = (slave * 5 + cam) % 100;
//            feeds.push({
//                id: feeds.length + 1,
//                src: `https://picsum.photos/id/${randomId}/400/300`,
//                slave: slave,
//                cam: cam,
//            });
//        }
//    }
//    return feeds;
//};

const generateCameraFeeds = (slaves) => {
    const feeds = [];
    const camerasPerSlave = 5;

    for (let cam = 0; cam < camerasPerSlave; cam++) {
        for (let i = 0; i < slaves.length; i++) {
            const slave = slaves[i];
            feeds.push({
                id: feeds.length + 1,
                src: `http://${slave.ip}:5000/video_feed?index=${cam}`,
                slave: slave.name, // đổi slave thành tên hoặc ip tuỳ bạn cần
                ip: slave.ip,       // thêm ip nếu cần
                cam: cam,
            });
        }
    }
    return feeds;
};

const StreamView = ({ slaves }) => {
    const images = generateCameraFeeds(slaves);
    console.log(images)
    const [selectedImage, setSelectedImage] = useState(null);
    const [terminatedSrc, setTerminatedSrc] = useState({});
    const [exposureTime, setExposureTime] = useState(10003);
    const [gain, setGain] = useState(2);
    const [gamma, setGamma] = useState(0.7);
    const [blackLevel, setBlackLevel] = useState(3);
    const [balanceRatioRed, setBalanceRatioRed] = useState(1.25);
    const [balanceRatioBlue, setBalanceRatioBlue] = useState(1.25);
    //const [lutEnabled, setLutEnabled] = useState(true);


    const [isVisible, setIsVisible] = useState(false);

    // Sử dụng useEffect để tạo delay 5 giây
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true); // Sau 5 giây, đặt isVisible thành true để render stream-grid
        }, 5000);

        // Cleanup timer khi component unmount
        return () => clearTimeout(timer);
    }, []); // Chỉ chạy một lần khi component mount

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
            const response = await fetch(`http://${selectedImage.ip}:3002/upload-configfile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: configText }),
            });

            console.log(response.json)

        } catch (err) {
            console.error('Lỗi khi gửi config:', err);
        }
    };


    const handleSaveAllConfigs = async () => {
        const configText = `[CameraSettings]
ExposureTime=${exposureTime}
Gain=${gain}
Gamma=${gamma}
BlackLevel=${blackLevel}
BalanceRatioRed=${balanceRatioRed.toFixed(2)}
BalanceRatioBlue=${balanceRatioBlue.toFixed(2)}
`;

        try {
            const promises = slaves.map(async (slave) => {
                const response = await fetch(`http://${slave.ip}:3002/upload-configfile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: configText }),
                });

                const result = await response.json();
                return { ip: slave.ip, success: true, message: result.message };
            });

            const results = await Promise.all(promises);

            // Thông báo tổng hợp kết quả
            const successIps = results.filter(r => r.success).map(r => r.ip);
            alert(`Đã gửi config thành công tới các máy:\n${successIps.join('\n')}`);
        } catch (err) {
            console.error('Lỗi khi gửi config đến các máy:', err);
            alert('Có lỗi khi gửi config tới một số máy.');
        }
    };



    const handleImageClick = (image) => {
        if (selectedImage) {
            setTerminatedSrc((prev) => ({
                ...prev,
                [selectedImage.id]: false,
            }));
        }
        setSelectedImage(image);
        setTerminatedSrc((prev) => ({
            ...prev,
            [image.id]: true,
        }));
    };

    const navigate = (direction) => {
        if (!selectedImage) return;
        const currentIndex = images.findIndex((img) => img.id === selectedImage.id);
        let newIndex;

        if (direction === 'left') {
            newIndex = (currentIndex - 1 + images.length) % images.length;
        } else {
            newIndex = (currentIndex + 1) % images.length;
        }

        setTerminatedSrc((prev) => ({
            ...prev,
            [selectedImage.id]: false,
        }));

        const newImage = images[newIndex];
        setSelectedImage(newImage);
        setTerminatedSrc((prev) => ({
            ...prev,
            [newImage.id]: true,
        }));
    };

    console.log(selectedImage)

    return (
        <div className="stream-container">

            <div>
                <div className="camera-config">
                   

                    <div className="inputs">
                        <div>
                            <label className="input-label">
                                Exposure Time: {exposureTime} µs
                            </label>
                            <input
                                type="range"
                                min={6}
                                max={30000000}
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
                                max={47.99}
                                value={gain}
                                onChange={(e) => setGain(Number(e.target.value))}
                                className="input-range"
                            />

                            
                        </div>
                       
                        <div>
                            <label className="input-label">
                                Gamma: {gamma.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min={0.25}
                                max={4}
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
                                min={-5}
                                max={10}
                                value={blackLevel}
                                onChange={(e) => setBlackLevel(Number(e.target.value))}
                                className="input-range"
                            />
                        </div>

                        <div>
                           

                            <label className="input-label">
                                Balance Ratio Red: {balanceRatioRed.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min={0.13}
                                max={8}
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
                                min={0.13}
                                max={8}
                                step={0.01}
                                value={balanceRatioBlue}
                                onChange={(e) => setBalanceRatioBlue(Number(e.target.value))}
                                className="input-range"
                            />
                        </div>

                        
                    </div>

                    <div className="button-box">
                        <button className="save-button" onClick={handleSaveConfig} disable={!selectedImage }>
                            {selectedImage ? `Cấu hình máy S${selectedImage.slave}` : 'Chọn máy để cấu hình'}
                        </button>


                        <button className="save-button" onClick={handleSaveAllConfigs}>
                            Cấu hình toàn bộ
                        </button>

                        <button className="save-button">
                            Lưu
                        </button>
                    </div>
                </div>
            </div>

            <div className="stream-main">
                {selectedImage ? (
                    <div>
                        <p>Slave {selectedImage.slave} - Cam { selectedImage.cam }</p>
                        <img
                            style={{ width: '500px', height: 'auto', objectFit: 'contain' }}
                            src={selectedImage.src}
                            alt={`Selected Camera ${selectedImage.slave}-${selectedImage.cam}`}
                            className="main-image"
                        />
                    </div>
                ) : (
                    <div className="no-image">No image selected</div>
                )}
                {selectedImage && (
                    <>
                        <button onClick={() => navigate('left')} className="nav-button left-button">
                            &larr;
                        </button>
                        <button onClick={() => navigate('right')} className="nav-button right-button">
                            &rarr;
                        </button>
                    </>
                )}
            </div>

            {isVisible ? (
            <div className="stream-grid">
                {images.map((image) => {
                    const isTerminated = terminatedSrc[image.id];
                    return (
                        <div key={image.id} className="thumbnail-wrapper">
                            <p
                                onClick={() => handleImageClick(image)}
                                className="thumbnail-title"
                            >
                                {image.slave} - {image.cam}
                            </p>
                            <img
                                src={!isTerminated ? `http://${image.ip}:5000/video_feed?index=${image.cam}` : ''}
                                alt={`S${image.slave}-C${image.cam}`}
                                className="thumbnail-image"
                            />
                        </div>
                    );
                })}
            </div>
            ) : null}

            {/*<div className="stream-grid">*/}
            {/*    {images.map((image) => {*/}
            {/*        const isTerminated = terminatedSrc[image.id];*/}
            {/*        return (*/}
            {/*            <div key={image.id} className="thumbnail-wrapper">*/}
            {/*                <p*/}
            {/*                    onClick={() => handleImageClick(image)}*/}
            {/*                    className="thumbnail-title"*/}
            {/*                >*/}
            {/*                    {image.slave} - {image.cam}*/}
            {/*                </p>*/}
            {/*                    <img*/}
            {/*                        src={!isTerminated ? `http://${image.ip}:5000/video_feed?index=${image.cam}` : ''}*/}
            {/*                        alt={`S${image.slave}-C${image.cam}`}*/}
            {/*                        className="thumbnail-image"*/}
            {/*                    />*/}

            {/*            </div>*/}
            {/*        );*/}
            {/*    })}*/}
            {/*</div>*/}
        </div>
    );
};

export default StreamView;
