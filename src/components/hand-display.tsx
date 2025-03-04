import React, { useRef, useEffect, useState } from "react";
import ThreeBox from "@/lib/three-box";
import { HandData } from "@/lib/three-box";

const HandDisplay: React.FC<{ handData: HandData | null }> = ({ handData }) => {
  const threeBox = useRef<ThreeBox | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [cam, setCam] = useState({ x: 0, y: 0.2, z: 1 });

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      threeBox.current = new ThreeBox(canvasRef.current, containerRef.current, statsRef.current);
      window.addEventListener("resize", threeBox.current.handleResize);
      threeBox.current.animate();
    }

    return () => {
      if (threeBox.current) {
        window.removeEventListener("resize", threeBox.current.handleResize);
        threeBox.current.cleanup();
      }
    };
  }, []);

  useEffect(() => {
    if (!threeBox.current) return;

    if (!handData || !handData.right) {
      threeBox.current.removeHand();
    } else {
      threeBox.current.addHand(handData);
    }
  }, [handData]);

  function updateCamera(x: number, y: number, z: number) {
    threeBox.current?.setCameraPosition(x, y, z);
    setCam({ x, y, z });
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      <div className="absolute bottom-0 right-0 flex gap-2">
        {["x", "y", "z"].map((axis) => (
          <span key={axis} className="p-0 border border-gray-50 rounded">
            <button
              className="h-full border border-black px-2"
              onClick={() => updateCamera(cam.x - (axis === "x" ? 0.1 : 0), cam.y - (axis === "y" ? 0.1 : 0), cam.z - (axis === "z" ? 0.1 : 0))}
            >
              -
            </button>
            {cam[axis as keyof typeof cam]}
            <button
              className="h-full border border-black px-2"
              onClick={() => updateCamera(cam.x + (axis === "x" ? 0.1 : 0), cam.y + (axis === "y" ? 0.1 : 0), cam.z + (axis === "z" ? 0.1 : 0))}
            >
              +
            </button>
          </span>
        ))}
      </div>
      <div ref={statsRef} className="absolute top-0 right-0">
      </div>
    </div>
  );
};

export default HandDisplay;
