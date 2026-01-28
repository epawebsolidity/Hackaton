"use client";

import { useState } from "react";

export default function Loading() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative flex items-center justify-center">
      {/* Skeleton loading */}
      {!isLoaded && (
        <div className="absolute w-full h-full bg-gray-300 animate-pulse rounded-full" />
      )}

      {/* Spinner */}
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
