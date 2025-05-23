'use client';
import React from 'react';

const LoadingAnimation = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse"></div>
    </div>
  );
};

export default LoadingAnimation;
