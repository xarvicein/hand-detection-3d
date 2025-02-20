"use client";
import HandDetect from "@/components/hand-detect";
import HandDisplay from "@/components/hand-display";
import { useState } from "react";

interface Point {
  x: number;
  y: number;
  z: number;
  visibility: number;
}
interface HandData {
  right: Point[];
}


export default function Home() {

  const [handData, setHandData] = useState<HandData| null>(null)

  const setHandResults = (results: HandData) => {
    setHandData(results)
  };
  return (
    <main className="flex flex-col justify-center h-screen w-screen p-4  font-[family-name:var(--font-geist-sans)]">
      <div className="border h-full border-gray-700 m-0 p-0 relative">
        <div className=" absolute left-3 top-3 z-30 w-40 "> 
          <HandDetect setHandResults={setHandResults} />
        </div>
        <div className="h-full w-full">
        <HandDisplay handData={handData} />

        </div>
      </div>
    </main>
  );
}
