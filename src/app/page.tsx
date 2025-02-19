"use client";
import HandDetect from "@/components/hand-detect";

export default function Home() {
  
  const setHandResults = (results) => {
    console.log(results)
  };
  return (
    <main className="flex flex-col justify-center h-screen w-screen p-4  font-[family-name:var(--font-geist-sans)]">
      <div className="border h-full border-gray-700 m-0 p-0 relative">
        <div className=" absolute left-3 top-3 z-30 w-40"> 
          <HandDetect setHandResults={setHandResults} />
        </div>
      </div>
    </main>
  );
}
