import React, { useState, useEffect } from "react";
import Xarrow, { Xwrapper } from "react-xarrows";
import "./App.css";
import "@wokwi/elements";
import Header from "./components/Header";

// --- TYPESCRIPT FIXES ---
// This tells TypeScript that these "wokwi-" tags are valid HTML elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-arduino-uno": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "wokwi-led": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { color?: string; value?: boolean; label?: string };
      "wokwi-pushbutton": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { color?: string; label?: string };
      "wokwi-resistor": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

// Define what a Component looks like
interface CanvasComponent {
  id: number;
  type: string;
  position: { x: number; y: number };
}

const COMPONENT_PALETTE = [
  "wokwi-arduino-uno",
  "wokwi-led",
  "wokwi-pushbutton",
];

function App() {
  // Explicitly tell useState that this is an array of CanvasComponents
  const [canvasComponents, setCanvasComponents] = useState<CanvasComponent[]>(
    [],
  );

  const [showCode, setShowCode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wiresVisible, setWiresVisible] = useState(false);
  const [isBtnPressed, setIsBtnPressed] = useState(false);
  const [code, setCode] = useState("");

  // auto code generation
  useEffect(() => {
    let setupCode = "void setup() {\n";
    let loopCode = "void loop() {\n";

    const hasLed = canvasComponents.some((c) => c.type === "wokwi-led");
    const hasBtn = canvasComponents.some((c) => c.type === "wokwi-pushbutton");

    if (hasLed) {
      setupCode += "  // LED connected to Pin 10 (Task 1 Default)\n";
      setupCode += "  pinMode(10, OUTPUT);\n";
    }
    if (hasBtn) {
      setupCode += "  // Button connected to Pin 2 (Task 1 Default)\n";
      setupCode += "  pinMode(2, INPUT);\n";
    }

    loopCode += "";
    if (hasLed && hasBtn) {
      loopCode += "  if (digitalRead(2) == HIGH) {\n";
      loopCode += "    digitalWrite(10, HIGH);\n";
      loopCode += "  } else {\n";
      loopCode += "    digitalWrite(10, LOW);\n";
      loopCode += "  }\n";
    }

    setupCode += "}\n";
    loopCode += "}";

    setCode(`${setupCode}\n${loopCode}`);
  }, [canvasComponents]);

  const handleRightClick = (event: React.MouseEvent, componentId: number) => {
    event.preventDefault();
    if (isPlaying) return;
    setCanvasComponents((prev) => prev.filter((c) => c.id !== componentId));
  };

  const onDragStartSidebar = (
    event: React.DragEvent,
    componentType: string,
  ) => {
    event.dataTransfer.setData("componentType", componentType);
  };

  const onDragStartCanvas = (
    event: React.DragEvent,
    component: CanvasComponent,
  ) => {
    event.dataTransfer.setData("componentId", component.id.toString());
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (isPlaying) return;

    const canvasRect = event.currentTarget.getBoundingClientRect();
    const movedComponentId = event.dataTransfer.getData("componentId");

    const getSnappedCoords = (clientX: number, clientY: number) => {
      const x = clientX - canvasRect.left;
      const y = clientY - canvasRect.top;
      const gridSize = 20;
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize,
      };
    };

    if (movedComponentId) {
      const { x, y } = getSnappedCoords(event.clientX, event.clientY);
      setCanvasComponents((prev) =>
        prev.map((c) =>
          c.id === Number(movedComponentId) ? { ...c, position: { x, y } } : c,
        ),
      );
    } else {
      const componentType = event.dataTransfer.getData("componentType");
      if (!componentType) return;

      const componentExists = canvasComponents.some(
        (c) => c.type === componentType,
      );
      if (componentExists) {
        alert("Task Requirement: Only one of each component allowed.");
        return;
      }

      const { x, y } = getSnappedCoords(event.clientX, event.clientY);

      setCanvasComponents((prev) => [
        ...prev,
        { id: Date.now(), type: componentType, position: { x, y } },
      ]);
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
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

        <div className="canvas-wrapper">
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
                  position: "absolute" as const, // TS needs "as const" for absolute
                  left: `${component.position.x}px`,
                  top: `${component.position.y}px`,
                  zIndex: 1,
                  cursor: isPlaying ? "default" : "grab",
                };

                return (
                  <div
                    id={`component-${component.id}`}
                    key={component.id}
                    style={style}
                    draggable={!isPlaying}
                    onDragStart={(e) => onDragStartCanvas(e, component)}
                    onContextMenu={(e) => handleRightClick(e, component.id)}
                    onMouseDown={() =>
                      component.type === "wokwi-pushbutton" &&
                      setIsBtnPressed(true)
                    }
                    onMouseUp={() => setIsBtnPressed(false)}
                    onMouseLeave={() => setIsBtnPressed(false)}
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

                        {/* d10 location arduino */}
                        <div
                          id={`pin-D10-${component.id}`}
                          className="ghost-pin"
                          style={{ left: "56%", top: "4%" }}
                        />

                        {/* D2 location atduino */}
                        <div
                          id={`pin-D2-${component.id}`}
                          className="ghost-pin"
                          style={{ left: "86%", top: "4%" }}
                        />

                        {/* arduino top gnd location */}
                        <div
                          id={`pin-GND-TOP-${component.id}`}
                          className="ghost-pin"
                          style={{ left: "42%", top: "4%" }}
                        />

                        {/* arduino gnd location */}
                        <div
                          id={`pin-GND-BOT-${component.id}`}
                          className="ghost-pin"
                          style={{ left: "62%", top: "94%" }}
                        />

                        {/* 3.3v location arduino */}
                        <div
                          id={`pin-VCC-BOT-${component.id}`}
                          className="ghost-pin"
                          style={{ left: "55%", top: "94%" }}
                        />
                      </div>
                    )}

                    {/* led */}
                    {component.type === "wokwi-led" && (
                      <div style={{ position: "relative" }}>
                        <wokwi-led color="red" value={isLedOn} label="10" />
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
                    )}

                    {/* button  */}
                    {component.type === "wokwi-pushbutton" && (
                      <div style={{ position: "relative" }}>
                        <wokwi-pushbutton color="green" label="2" />
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
                    start={`pin-D10-${arduino.id}`}
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
                    end={`pin-GND-TOP-${arduino.id}`}
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
                    start={`pin-D2-${arduino.id}`}
                    end={`btn-top-${btn.id}`}
                    startAnchor="middle"
                    endAnchor="middle"
                    color="#f1c40f"
                    strokeWidth={4}
                    path="curved"
                    showHead={false}
                    zIndex={100}
                  />

                  {/* black wire for button gnd */}
                  <Xarrow
                    start={`btn-gnd-${btn.id}`}
                    end={`pin-GND-BOT-${arduino.id}`}
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
                    end={`pin-VCC-BOT-${arduino.id}`}
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
