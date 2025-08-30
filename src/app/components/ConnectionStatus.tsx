'use client';
import { useState, useEffect } from 'react';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    // Check initial connection status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      
      // Hide "Back online" message after 3 seconds
      setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show anything if online and not showing "Back online" message
  if (isOnline && !showBackOnline) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-3 text-center text-white font-medium transition-all duration-300 ${
      isOnline 
        ? 'bg-green-500' 
        : 'bg-red-500'
    }`}>
      {isOnline ? 'Back online' : 'You are offline'}
    </div>
  );
}