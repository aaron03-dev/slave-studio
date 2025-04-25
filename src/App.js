import React, { useEffect, useState } from 'react';

import './App.css';
import Home from './pages/home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CameraConfig from './pages/config';
import { AppSidebar } from './components/sidebar';
import FlirCapture from './components/capture';
import Retrieve from './components/retrieve';
import StreamView from './components/StreamViews';


function App() {

    const [slaves, setSlaves] = useState([
        {
            name: 'Slave_12',
            ip: '192.168.100.212', // Sửa IP theo thực tế
        },
    ])

    const [sec, setSec] = useState("System")

    

    const renderContent = () => {
        switch (sec) {
            case "System":
                return (
                    <Home
                        
                        slaves={slaves}
                        setSlaves={setSlaves}
                       
                    />
                );
            case "Liveview":
                return <StreamView />;
            case "Capture":
                return <FlirCapture slaves={slaves} />;
            case "Retrieve":
                return <Retrieve />;
            case "Convert":
                return <div>Convert Section (Placeholder)</div>;
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
                <div style={{ marginLeft: 200 }}>
                    { renderContent() }
                </div>
            </div>
        </Router>
       
        // <Router>
        //    <Routes>
        //        <Route
        //            path="/"
        //            element={
        //                <Home
        //                    handleStartAll={handleStartAll}
        //                    handleUploadExeToAll={handleUploadExeToAll}
        //                    handleDeleteAll={handleDeleteAll}
        //                    handleStopAll={handleStopAll}
        //                    setFileAll={setFileAll}
        //                    fileAll={fileAll}
        //                    loading={loading}
        //                    folderName={folderName}
        //                    setFolderName={setFolderName}
        //                    slaves={slaves}
        //                    completedSlaves={completedSlaves}
        //                    handleStartSlave={handleStartSlave}
        //                    handleStopSlave={handleStopSlave}
        //                    handleStream={handleStream}
        //                    handleDownload={handleDownload}
        //                    updateFolderStatus={updateFolderStatus}
        //                />
        //            }
        //        />

        //        <Route
        //            path="/config-camera"
        //            element={
        //                <CameraConfig />
        //            }
        //        />
        //    </Routes>
        //</Router>
        
    );
}

export default App;
