import React, { useRef, useEffect, useState } from "react";
import ThreeBox from "@/lib/three-box";
import { HandData } from "@/lib/three-box";

const HandDisplay: React.FC<{ handData: HandData | null }> = ({ handData }) => {
  const threeBox = useRef<ThreeBox | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cam, setCam] = useState({ x: 0, y: -1, z: 1 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      threeBox.current = new ThreeBox(canvasRef.current, containerRef.current);
      threeBox.current.animate();
    }
  }, []);

  function updateCamera(x: number, y: number, z: number) {
    threeBox.current?.setCameraPosition(x, y, z);
    setCam({ x, y, z });
  }

  useEffect(() => {
    if (!containerRef.current || !handData || !handData.right) {
      threeBox.current?.removeHand();
      return;
    }
    threeBox.current?.addHand(handData);
    threeBox.current?.animate();

    // Create points geometry
    // const geometry = new THREE.BufferGeometry();
    // const positions = new Float32Array(handData.right.length * 3); // 3 coordinates per point
    // handData.right.forEach((point, index) => {
    //   positions[index * 3] = point.x - 0.5;
    //   positions[index * 3 + 1] = point.y - 0.8;
    //   positions[index * 3 + 2] = point.z;
    // });
    // geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    // // Create points material
    // const material = new THREE.PointsMaterial({
    //   color: 0xff0000,
    //   size: 0.02,
    //   sizeAttenuation: true,
    //   alphaTest: 0.5,
    //   transparent: true,
    // }); // Red points
    // material.color.setHSL(1.0, 0.3, 0.7, THREE.SRGBColorSpace);
    // // Create points object
    // const pointsObject = new THREE.Points(geometry, material);
    // scene.add(pointsObject);
    return () => {
      threeBox.current?.cleanup();
    };
  }, [handData]);

  return (
    <div ref={containerRef} className="w-full h-full ">
      <canvas
        ref={canvasRef}
        className=""
        style={{ width: "100%", height: "100%" }}
      />
      <div className=" absolute bottom-0 right-0 flex gap-2">
        <span className="p-0 border border-gray-50 rounded">
          <button
            className="h-full border border-black px-2"
            onClick={() => {
              updateCamera(cam.x - 1, cam.y, cam.z);
            }}
          >
            -
          </button>
          {cam.x}
          <button
            className="h-full border border-black px-2"
            onClick={() => {
              updateCamera(cam.x + 1, cam.y, cam.z);
            }}
          >
            +
          </button>
        </span>
        <span className="p-0 border border-gray-50 rounded">
          <button
            className="h-full border border-black px-2"
            onClick={() => {
              updateCamera(cam.x, cam.y - 1, cam.z);
            }}
          >
            -
          </button>
          {cam.y}
          <button
            className="h-full border border-black px-2"
            onClick={() => {
              updateCamera(cam.x, cam.y + 1, cam.z);
            }}
          >
            +
          </button>
        </span>
        <span className="p-0 border border-gray-50 rounded">
          <button
            className="h-full border border-black px-2"
            onClick={() => {
              updateCamera(cam.x, cam.y, cam.z - 1);
            }}
          >
            -
          </button>
          {cam.z}
          <button
            className="h-full border border-black px-2"
            onClick={() => {
              updateCamera(cam.x, cam.y, cam.z + 1);
            }}
          >
            +
          </button>
        </span>
      </div>
    </div>
  );
};
export default HandDisplay;
