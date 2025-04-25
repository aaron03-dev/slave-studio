// src/components/FlirCapture.jsx
import React from "react"
import "../assets/capture.css"

const FlirCapture = ({ slaves }) => {
  

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
    <div className="flir-capture">
      <header className="header">
        <div></div>
        <div className="title">
          <h1>FLIR Capture</h1>
          <p>by 4DSCANLAB</p>
        </div>
        <button className="settings-button">⚙️</button>
      </header>

      <div className="main-content">
        <div className="left-panel">
          <div className="control-buttons">
            <button className="control-button arm-button">
              <div className="icon">((o))</div>
              <div className="label">
                ARM ALL
                <br />
                CAMERAS
              </div>
            </button>

            <button className="control-button start-button">
              <div className="icon">▶</div>
              <div className="label">
                START
                <br />
                RECORD
              </div>
            </button>

            <button className="control-button stop-button">
              <div className="icon">◼</div>
              <div className="label">
                CANCEL /<br />
                STOP REC
              </div>
            </button>
          </div>

          <div className="take-input-container">
            <div className="take-input-label">Take</div>
            <div className="take-input-wrapper">
              <input
                type="text"
                className="take-input"
                value="Volumetric_Capture_Take1"
                readOnly
              />
              <button className="clear-button">✕</button>
            </div>
            <div className="take-input-help">
              Enter take name to start recording
            </div>
          </div>

          <div className="recording-status">
            <div className="section-title">RECORDING STATUS</div>
            <div className="status-text">
              Supporting line text lorem ipsum dolor sit amet, consectetur.
            </div>
          </div>

          <div className="recorded-takes">
            <div className="section-title">RECORDED TAKES</div>
            <div className="takes-list">
              {recordedTakes.map((take, index) => (
                <div key={index} className="take-item">
                  {index + 1}. {take}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-panel">
          {slaves.map((slave) => (
            <div key={slave} className="slave-box">
              <div className="slave-title">
                SLAVE {slave.toString().padStart(2, "0")}
              </div>
              <div className="slave-stats">
                <div className="ram-load">RAM LOAD</div>
                <div className="load-value">8D</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FlirCapture
