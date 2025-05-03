import { Home, Search, Radio, List, Music, Circle } from "lucide-react";

export function AppSidebar({ sec, setSec }) {
    return (
        <>
            <style>{`
        .sidebar {
            z-index: 100;
          width: 200px;
          height: 100vh;
          background-color: #1e1e1e;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: fixed;
        }

        .logo-section {
          height: 64px;
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
          background-color: #121212;
        }

        .logo {
          font-size: 18px;
          font-weight: bold;
          color: white;
        }

        .version {
          font-size: 12px;
          color: #aaa;
        }

        .sidebar-section {
          padding: 16px 0;
        }

        .section-title {
          font-size: 12px;
          font-weight: 600;
          color: #888;
          text-align: center;
          margin-bottom: 8px;
        }

        .sidebar-buttons {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sidebar-button {
          width: 100%;
          height: 50px;
          background: none;
          border: none;
          cursor: pointer;
          color: #ccc;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-around;
          transition: color 0.2s, background-color 0.2s;
        }

        .sidebar-button:hover svg {
          color: white;
        }

        .sidebar-button span {
          font-size: 12px;
          margin-top: 4px;
          color: white;
        }

        .sidebar-button.active {
          background-color: #333;
          color: white;
        }

        .sidebar-button.active svg {
          color: white;
        }

        .status-section {
          height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .status-text {
          font-size: 12px;
          color: #22c55e;
          margin-top: 2px;
        }

        .status-line {
          width: 60%;
          height: 2px;
          background-color: #22c55e;
          margin-top: 6px;
          border-radius: 2px;
        }
      `}</style>

            <div className="sidebar">
                <div className="sidebar-section logo-section">
                    <h1 className="logo">RECVOL</h1>
                    <span className="version">v1.0</span>
                </div>

                <div className="sidebar-section">
                    <h2 className="section-title">INITIATE</h2>
                    <div className="sidebar-buttons">
                        <button
                            className={`sidebar-button ${sec === "System" ? "active" : ""}`}
                            onClick={() => setSec("System")}
                        >
                            <Home size={18} />
                            <span>System</span>
                        </button>
                        <button
                            className={`sidebar-button ${sec === "Liveview" ? "active" : ""}`}
                            onClick={() => setSec("Liveview")}
                        >
                            <Search size={18} />
                            <span>Liveview</span>
                        </button>
                        <button
                            className={`sidebar-button ${sec === "Capture" ? "active" : ""}`}
                            onClick={() => setSec("Capture")}
                        >
                            <Radio size={18} />
                            <span>Capture</span>
                        </button>
                    </div>
                </div>

                <div className="sidebar-section">
                    <h2 className="section-title">TRANSFER</h2>
                    <div className="sidebar-buttons">
                        <button
                            className={`sidebar-button ${sec === "Retrieve" ? "active" : ""}`}
                            onClick={() => setSec("Retrieve")}
                        >
                            <List size={18} />
                            <span>Retrieve</span>
                        </button>
                        <button
                            className={`sidebar-button ${sec === "Convert" ? "active" : ""}`}
                            onClick={() => setSec("Convert")}
                        >
                            <Music size={18} />
                            <span>Convert</span>
                        </button>
                        <button
                            className={`sidebar-button ${sec === "XMP+" ? "active" : ""}`}
                            onClick={() => setSec("XMP+")}
                        >
                            <Circle size={18} />
                            <span>XMP+</span>
                        </button>
                    </div>
                </div>

                <div className="sidebar-section status-section">
                    <h2 className="section-title">STATUS</h2>
                    <p className="status-text">ALL 50 FLR</p>
                    <p className="status-text">ONLINE</p>
                    <div className="status-line"></div>
                </div>
            </div>
        </>
    );
}