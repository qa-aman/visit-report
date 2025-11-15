'use client';

import { useEffect, useRef } from 'react';
import { getCurrentUser } from '@/lib/storage';

export default function Home() {
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current || typeof window === 'undefined') return;
    
    const currentPath = window.location.pathname;
    // Don't redirect if already on target pages
    if (currentPath === '/login' || currentPath === '/dashboard') {
      return;
    }
    
    hasRedirected.current = true;
    
    try {
      const user = getCurrentUser();
      const targetPath = user ? '/dashboard' : '/login';
      
      // Only redirect if not already on target
      if (currentPath !== targetPath) {
        window.location.replace(targetPath);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      if (currentPath !== '/login') {
        window.location.replace('/login');
      }
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

