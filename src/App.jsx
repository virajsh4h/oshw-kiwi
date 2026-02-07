import { useState } from "react";
import "./App.css";
import "@wokwi/elements";
import Header from "./components/Header";

const COMPONENT_PALETTE = [
  "wokwi-arduino-uno",
  "wokwi-led",
  "wokwi-pushbutton",
];

function App() {
  const [canvasComponents, setCanvasComponents] = useState([]);

  const handleRightClick = (event, componentId) => {
    event.preventDefault();
    setCanvasComponents((prev) => prev.filter((c) => c.id !== componentId));
  };

  // sidebar only
  const onDragStartSidebar = (event, componentType) => {
    event.dataTransfer.setData("componentType", componentType);
  };

  const onDragStartCanvas = (event, component) => {
    event.dataTransfer.setData("componentId", component.id);
  };

  const onDrop = (event) => {
    event.preventDefault();
    const canvasRect = event.currentTarget.getBoundingClientRect();

    // existing component checking
    const movedComponentId = event.dataTransfer.getData("componentId");

    if (movedComponentId) {
      const newX = event.clientX - canvasRect.left;
      const newY = event.clientY - canvasRect.top;
      const gridSize = 50;
      const snappedX = Math.round(newX / gridSize) * gridSize;
      const snappedY = Math.round(newY / gridSize) * gridSize;

      setCanvasComponents((prev) =>
        prev.map((c) =>
          c.id === Number(movedComponentId)
            ? { ...c, position: { x: snappedX, y: snappedY } }
            : c,
        ),
      );
    } else {
      const componentType = event.dataTransfer.getData("componentType");
      if (!componentType) return;

      //
      const componentExists = canvasComponents.some(
        (c) => c.type === componentType,
      );

      // grid snapping based on css radial grid
      const x = event.clientX - canvasRect.left;
      const y = event.clientY - canvasRect.top;
      const gridSize = 50;
      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedY = Math.round(y / gridSize) * gridSize;

      if (componentType === "wokwi-led") {
        const ledId = Date.now();

        const newLed = {
          id: ledId,
          type: "wokwi-led",
          position: { x: snappedX, y: snappedY },
        };

        setCanvasComponents((prev) => [...prev, newLed]);
      } else {
        const newComponent = {
          id: Date.now(),
          type: componentType,
          position: { x: snappedX, y: snappedY },
        };
        setCanvasComponents((prev) => [...prev, newComponent]);
      }
    }
  };

  const onDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <div className="sidebar">
          <h3>Components</h3>
          {COMPONENT_PALETTE.map((type) => {
            const isPlaced = canvasComponents.some((c) => c.type === type);
            return (
              <div
                draggable={!isPlaced} // not draggable if already placed
                onDragStart={(e) => onDragStartSidebar(e, type)}
                key={type}
                className={`item ${isPlaced ? "disabled" : ""}`} // assign a new class that makes the text red
              >
                {type.replace("wokwi-", "")}
              </div>
            );
          })}
        </div>

        <div className="canvas" onDrop={onDrop} onDragOver={onDragOver}>
          <h6>
            <em>(Right click to delete components)</em>
          </h6>
          {canvasComponents.map((component) => {
            const style = {
              position: "absolute",
              left: `${component.position.x}px`,
              top: `${component.position.y}px`,
            };
            return (
              <div
                key={component.id}
                style={style}
                draggable
                onDragStart={(e) => onDragStartCanvas(e, component)}
                onContextMenu={(e) => handleRightClick(e, component.id)}
              >
                {/* super simple IF statements to render components */}
                {component.type === "wokwi-arduino-uno" && (
                  <wokwi-arduino-uno />
                )}
                {component.type === "wokwi-led" && <wokwi-led color="red" />}
                {component.type === "wokwi-pushbutton" && <wokwi-pushbutton />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
