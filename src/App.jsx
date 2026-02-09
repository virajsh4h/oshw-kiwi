import { useState, useEffect } from "react";
import Xarrow, { Xwrapper } from "react-xarrows";
import "./App.css";
import "@wokwi/elements";
import Header from "./components/Header";

const COMPONENT_PALETTE = [
  "wokwi-arduino-uno",
  "wokwi-led",
  "wokwi-pushbutton",
];

// All Arduino Digital Pins
const ALL_PINS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
];

const PIN_LOCATIONS = {
  2: { left: "86%", top: "4%" },
  3: { left: "81%", top: "4%" },
  4: { left: "76%", top: "4%" },
  5: { left: "71%", top: "4%" },
  6: { left: "66%", top: "4%" },
  7: { left: "61%", top: "4%" },
  8: { left: "51%", top: "4%" },
  9: { left: "46%", top: "4%" },
  10: { left: "56%", top: "4%" },
  11: { left: "36%", top: "4%" },
  12: { left: "31%", top: "4%" },
  13: { left: "26%", top: "4%" },
  GND_TOP: { left: "42%", top: "4%" },
  GND_BOT: { left: "62%", top: "94%" },
  VCC_BOT: { left: "55%", top: "94%" },
};

function App() {
  const [canvasComponents, setCanvasComponents] = useState([]);

  const [showCode, setShowCode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // simulate mode
  const [wiresVisible, setWiresVisible] = useState(false);
  const [isBtnPressed, setIsBtnPressed] = useState(false);
  const [code, setCode] = useState("");
  const [pinAssignments, setPinAssignments] = useState({
    ledPin: "10", // default led
    btnPin: "2", // default btn
  });
  const [draggedComponent, setDraggedComponent] = useState(null);

  // auto code generation
  useEffect(() => {
    let setupCode = "void setup() {\n";
    let loopCode = "void loop() {\n";
    const hasLed = canvasComponents.some((c) => c.type === "wokwi-led");
    const hasBtn = canvasComponents.some((c) => c.type === "wokwi-pushbutton");
    if (hasLed) {
      setupCode += `  // LED connected to Pin ${pinAssignments.ledPin}\n`;
      setupCode += `  pinMode(${pinAssignments.ledPin}, OUTPUT);\n`;
    }
    if (hasBtn) {
      setupCode += `  // Button connected to Pin ${pinAssignments.btnPin}\n`;
      setupCode += `  pinMode(${pinAssignments.btnPin}, INPUT);\n`;
    }
    loopCode += "";
    if (hasLed && hasBtn) {
      loopCode += `  if (digitalRead(${pinAssignments.btnPin}) == HIGH) {\n`;
      loopCode += `    digitalWrite(${pinAssignments.ledPin}, HIGH);\n`;
      loopCode += "  } else {\n";
      loopCode += `    digitalWrite(${pinAssignments.ledPin}, LOW);\n`;
      loopCode += "  }\n";
    }
    setupCode += "}\n";
    loopCode += "}";
    setCode(`${setupCode}\n${loopCode}`);
  }, [canvasComponents, pinAssignments]);

  const handleRightClick = (event, componentId) => {
    event.preventDefault();
    if (isPlaying) return; // if is playing then prevent deleting
    setCanvasComponents((prev) => prev.filter((c) => c.id !== componentId));
  };

  const onDragStartSidebar = (event, componentType) => {
    event.dataTransfer.setData("componentType", componentType);
  };

  const onDrop = (event) => {
    event.preventDefault();
    if (isPlaying || draggedComponent) return;

    const canvasRect = event.currentTarget.getBoundingClientRect();
    const componentType = event.dataTransfer.getData("componentType");
    if (!componentType) return;
    const componentExists = canvasComponents.some(
      (c) => c.type === componentType,
    );
    if (componentExists) {
      alert("Task Requirement: Only one of each component allowed.");
      return;
    }
    const gridSize = 20;
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;

    setCanvasComponents((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: componentType,
        position: { x: snappedX, y: snappedY },
      },
    ]);
  };

  const onDragOver = (event) => {
    event.preventDefault();
  };

  const handleMouseDown = (event, component) => {
    if (isPlaying) return;
    setDraggedComponent(component);
  };

  const handleMouseMove = (event) => {
    if (!draggedComponent) return;
    const canvasRect = event.currentTarget.getBoundingClientRect();
    const newX = event.clientX - canvasRect.left;
    const newY = event.clientY - canvasRect.top;
    setCanvasComponents((prev) =>
      prev.map((c) =>
        c.id === draggedComponent.id
          ? { ...c, position: { x: newX, y: newY } }
          : c,
      ),
    );
  };

  const handleMouseUp = () => {
    if (!draggedComponent) return;
    setCanvasComponents((prev) =>
      prev.map((c) => {
        if (c.id === draggedComponent.id) {
          const gridSize = 20;
          const snappedX = Math.round(c.position.x / gridSize) * gridSize;
          const snappedY = Math.round(c.position.y / gridSize) * gridSize;
          return { ...c, position: { x: snappedX, y: snappedY } };
        }
        return c;
      }),
    );
    setDraggedComponent(null);
  };

  const arduino = canvasComponents.find((c) => c.type === "wokwi-arduino-uno");
  const led = canvasComponents.find((c) => c.type === "wokwi-led");
  const btn = canvasComponents.find((c) => c.type === "wokwi-pushbutton");
  const isLedOn = isPlaying && isBtnPressed;

  return (
    <div className="app-container">
      <Header
        isPlaying={isPlaying}
        onTogglePlay={() => {
          setIsPlaying(!isPlaying);
          setWiresVisible(true);
          setIsBtnPressed(false);
        }}
        showCode={showCode}
        onToggleCode={setShowCode}
        hasComponents={canvasComponents.length > 0}
      />
      <div className="main-content">
        <div className="sidebar">
          <h3>Component Library</h3>
          {COMPONENT_PALETTE.map((type) => {
            const isPlaced = canvasComponents.some((c) => c.type === type);
            return (
              <div
                draggable={!isPlaced && !isPlaying}
                onDragStart={(e) => onDragStartSidebar(e, type)}
                key={type}
                className={`item ${isPlaced ? "disabled" : ""}`}
              >
                {type.replace("wokwi-", "")}
              </div>
            );
          })}
        </div>
        <div
          className="canvas-wrapper"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="canvas" onDrop={onDrop} onDragOver={onDragOver}>
            <button
              className="wire-toggle-btn"
              onClick={() => setWiresVisible(!wiresVisible)}
            >
              {wiresVisible ? "🔌 Hide Wires" : "🔌 Connect Wires"}
            </button>
            {/* ux friendly text */}
            {canvasComponents.length === 0 && (
              <h6 className="canvas-placeholder">Drag components here...</h6>
            )}
            {canvasComponents.length >= 1 && (
              <h6 className="canvas-placeholder">
                Right click to delete components.
              </h6>
            )}
            <Xwrapper>
              {canvasComponents.map((component) => {
                const style = {
                  position: "absolute",
                  left: `${component.position.x}px`,
                  top: `${component.position.y}px`,
                  zIndex: 1,
                  cursor: isPlaying
                    ? "default"
                    : draggedComponent?.id === component.id
                      ? "grabbing"
                      : "grab",
                };
                return (
                  <div
                    id={`component-${component.id}`}
                    key={component.id}
                    style={style}
                    onMouseDown={(e) => handleMouseDown(e, component)}
                    onContextMenu={(e) => handleRightClick(e, component.id)}
                  >
                    {/* arduino */}
                    {component.type === "wokwi-arduino-uno" && (
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <wokwi-arduino-uno />
                        {Object.entries(PIN_LOCATIONS).map(([pin, coords]) => (
                          <div
                            key={pin}
                            id={`pin-${pin}-${component.id}`}
                            className="ghost-pin"
                            style={{ left: coords.left, top: coords.top }}
                          />
                        ))}
                      </div>
                    )}
                    {/* led */}
                    {component.type === "wokwi-led" && (
                      <div style={{ position: "relative" }}>
                        <div className="component-wrapper">
                          <wokwi-led color="red" value={isLedOn} />
                          <span className="tooltip">
                            Remember to add a resistor! (e.g., 220Ω)
                          </span>
                          <select
                            className="pin-selector"
                            value={pinAssignments.ledPin}
                            onChange={(e) =>
                              setPinAssignments({
                                ...pinAssignments,
                                ledPin: e.target.value,
                              })
                            }
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            {ALL_PINS.map((pin) => (
                              <option
                                key={pin}
                                value={pin}
                                disabled={pin === pinAssignments.btnPin}
                              >
                                D{pin}
                              </option>
                            ))}
                          </select>
                          <div
                            id={`led-anode-${component.id}`}
                            className="ghost-pin"
                            style={{ left: "25px", bottom: "4px" }}
                          />
                          <div
                            id={`led-cathode-${component.id}`}
                            className="ghost-pin"
                            style={{ left: "15px", bottom: "-25px" }}
                          />
                        </div>
                      </div>
                    )}
                    {/* button  */}
                    {component.type === "wokwi-pushbutton" && (
                      <div
                        style={{ position: "relative" }}
                        onMouseDown={(e) => {
                          if (isPlaying) {
                            e.stopPropagation();
                            setIsBtnPressed(true);
                          }
                        }}
                        onMouseUp={() => setIsBtnPressed(false)}
                        onMouseLeave={() => setIsBtnPressed(false)}
                      >
                        <wokwi-pushbutton color="green" />
                        <select
                          className="pin-selector"
                          value={pinAssignments.btnPin}
                          onChange={(e) =>
                            setPinAssignments({
                              ...pinAssignments,
                              btnPin: e.target.value,
                            })
                          }
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          {ALL_PINS.map((pin) => (
                            <option
                              key={pin}
                              value={pin}
                              disabled={pin === pinAssignments.ledPin}
                            >
                              D{pin}
                            </option>
                          ))}
                        </select>
                        <div
                          id={`btn-top-${component.id}`}
                          className="ghost-pin"
                          style={{ left: "68px", top: "12px" }}
                        />
                        <div
                          id={`btn-vcc-${component.id}`}
                          className="ghost-pin"
                          style={{ left: "0px", bottom: "0px" }}
                        />
                        <div
                          id={`btn-gnd-${component.id}`}
                          className="ghost-pin"
                          style={{ left: "68px", bottom: "0px" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              {/*  Pin wiring and styling  */}
              {wiresVisible && arduino && led && (
                <>
                  {/* blue wire for led / Arduino D10 */}
                  <Xarrow
                    start={`pin-${pinAssignments.ledPin}-${arduino.id}`}
                    end={`led-anode-${led.id}`}
                    startAnchor="middle"
                    endAnchor="bottom"
                    color="#000dff"
                    strokeWidth={4}
                    path="straight"
                    showHead={false}
                    zIndex={100}
                  />
                  {/* black wire for led gnd */}
                  <Xarrow
                    start={`led-cathode-${led.id}`}
                    end={`pin-GND_TOP-${arduino.id}`}
                    startAnchor="top"
                    endAnchor="middle"
                    color="#2c3e50"
                    strokeWidth={4}
                    path="straight"
                    showHead={false}
                    zIndex={100}
                  />
                </>
              )}
              {wiresVisible && arduino && btn && (
                <>
                  {/* yellow wire for button / arduino d2 */}
                  <Xarrow
                    start={`pin-${pinAssignments.btnPin}-${arduino.id}`}
                    end={`btn-top-${btn.id}`}
                    startAnchor="middle"
                    endAnchor="middle"
                    color="#f1c40f"
                    strokeWidth={4}
                    path="smooth"
                    showHead={false}
                    zIndex={100}
                  />
                  {/* black wire for button gnd */}
                  <Xarrow
                    start={`btn-gnd-${btn.id}`}
                    end={`pin-GND_BOT-${arduino.id}`}
                    startAnchor="middle"
                    endAnchor="middle"
                    color="#2c3e50"
                    strokeWidth={4}
                    path="straight"
                    showHead={false}
                    zIndex={100}
                  />
                  {/* red wire for button vcc (3.3v) */}
                  <Xarrow
                    start={`btn-vcc-${btn.id}`}
                    end={`pin-VCC_BOT-${arduino.id}`}
                    startAnchor="middle"
                    endAnchor="middle"
                    color="#ff0000"
                    strokeWidth={4}
                    path="straight"
                    showHead={false}
                    zIndex={100}
                  />
                </>
              )}
            </Xwrapper>
          </div>
          <div className={`code-panel ${showCode ? "open" : ""}`}>
            <div className="code-header">Generated Source (Arduino C++)</div>
            <div className="code-content">{code}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
