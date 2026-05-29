"use client";

import { useState } from "react";
import Link from "next/link";

export default function WritePage() {
  const [text, setText] = useState("Hello World!");

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-emerald-400">Write Page Test</h1>
        <div className="bg-gray-800 p-6 rounded-xl mb-6">
          <p className="text-lg mb-4">This is a simple test page to check if everything works.</p>
          <input 
            type="text" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            className="w-full p-3 rounded-lg bg-gray-700 text-white"
          />
          <p className="mt-4 text-emerald-300">{text}</p>
        </div>
        <Link href="/" className="inline-block bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl font-medium">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
