import React, { useRef, useEffect } from "react";
import * as THREE from "three";
// @ts-expect-error OrbitControls doeas exist
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface Point {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface HandData {
  right: Point[];
}

const HandDisplay: React.FC<{ handData: HandData | null }> = ({ handData }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !handData || !handData.right) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    // @ts-expect-error canvas element will be always assigned
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current }); 
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );

    // Create points geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(handData.right.length * 3); // 3 coordinates per point
    handData.right.forEach((point, index) => {
      positions[index * 3] = point.x - 0.5;
      positions[index * 3 + 1] = point.y - 0.5;
      positions[index * 3 + 2] = point.z;
    });
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Create points material
    const material = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 0.02,
      sizeAttenuation: true,
      alphaTest: 0.5,
      transparent: true,
    }); // Red points
    material.color.setHSL(1.0, 0.3, 0.7, THREE.SRGBColorSpace);
    // Create points object
    const pointsObject = new THREE.Points(geometry, material);
    scene.add(pointsObject);

    // Create lines between points
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff }); // Blue lines
    const handLandmarking = [
      [0, 1, 2, 3, 4], 
      [0, 5, 6, 7, 8], 
      [9, 10, 11, 12],
      [13, 14, 15, 16],
      [5, 9, 13, 17],
      [0, 17, 18, 19, 20]
    ];
    handLandmarking.forEach((item) => {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(
        item.map(
          (point) => new THREE.Vector3(handData.right[point].x - 0.5, handData.right[point].y - 0.5, handData.right[point].z)
        )
      );
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
    });

    // Set camera position
    camera.position.z = 0.5; // Adjust for better view

    // Add OrbitControls for interactivity
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        camera.aspect =
          containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      // lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, [handData]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        className=" rotate-180"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
export default HandDisplay;
