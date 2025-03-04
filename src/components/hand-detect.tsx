import {
  FilesetResolver,
  HandLandmarker,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";
import React, { useEffect, useRef } from "react";
import { HandData } from "@/lib/three-box";

type props = {
  setHandResults: (results: HandData) => void;
};
async function initVideo(videoElement: HTMLVideoElement) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  videoElement.srcObject = stream;
  videoElement.addEventListener("loadeddata", () => {
    videoElement.play();
  });
}

async function initModel() {
  const wasm = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  const handlandMarker = HandLandmarker.createFromOptions(wasm, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    numHands: 2,
    runningMode: "VIDEO",
  });
  return handlandMarker;
}

function HandDetect({ setHandResults }: props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const detetctInterval = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    startHandDetection();
    return () => {
      if (detetctInterval.current) {
        clearInterval(detetctInterval.current);
      }
    };
  }, []);

  const startHandDetection = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    await initVideo(videoElement);
    const handLandMarker = await initModel();
    detetctInterval.current = setInterval(() => {
      const detections = handLandMarker.detectForVideo(
        videoElement,
        Date.now()
      );
      processDetections(detections, setHandResults);
    }, 100);
  };
  return (
    <div>
      <video className="-scale-x-1" ref={videoRef}></video>
      {/* className='-scale-x-1' */}
    </div>
  );
}

export default HandDetect;

function processDetections(
  detections: HandLandmarkerResult,
  setHandResults: (results: HandData) => void
) {
  if (detections && detections.handedness.length >= 1) {
    for (const data of detections.handedness) {
      if (data[0].categoryName === "Right") {
        setHandResults({
          right: { landmarks: detections.landmarks[data[0].index] },
        });
        break;
      }
    }
  } else {
    console.log(detections);
    setHandResults({ right: null });
  }
}
