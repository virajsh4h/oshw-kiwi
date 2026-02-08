import "./Header.css";

interface HeaderProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  showCode: boolean;
  onToggleCode: (show: boolean) => void;
  hasComponents: boolean;
}

function Header({
  isPlaying,
  onTogglePlay,
  showCode,
  onToggleCode,
  hasComponents,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="logo-section">
        <h1 className="app-title">OSHW-Kiwi 🥝</h1>
      </div>

      <div className="toolbar-section">
        <div className="view-toggle">
          <button
            className={`tool-btn ${!showCode ? "active" : ""}`}
            onClick={() => onToggleCode(false)}
          >
            Component View
          </button>
          <button
            className={`tool-btn ${showCode ? "active" : ""}`}
            onClick={() => onToggleCode(true)}
          >
            Code View
          </button>
        </div>

        {isPlaying ? (
          <button className="action-btn stop-btn" onClick={onTogglePlay}>
            ⏹ Stop Simulation
          </button>
        ) : (
          <button
            className="action-btn start-btn"
            onClick={onTogglePlay}
            disabled={!hasComponents} // disable if there are no components to simulate
          >
            ▶ Start Simulation
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
