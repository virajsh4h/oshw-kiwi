import React from "react";
import "./Header.css";

function Header() {
  return (
    <header className="app-header">
      <h1 className="app-title">OSHW-Kiwi 🥝</h1>
      <div className="header-buttons">
        <div className="views">
          <button onClick={console.log("Design View")}>Design View</button>
          <button onClick={console.log("Code View")}>Code View</button>
        </div>
        <button
          onClick={console.log("Simulating Circuit")}
          className="simulate-btn"
        >
          ➡️ Simulate
        </button>
        <button onClick={console.log("Uploading COde")}>Upload Code</button>
      </div>
    </header>
  );
}

export default Header;
