
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // The middleware should handle the redirection.
    // This is a fallback in case middleware is not configured for the root.
    // For a better UX, we'll try to redirect immediately.
    // A better approach is to ensure middleware covers the root path.
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
    </div>
  );
}
