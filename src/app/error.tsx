'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Please try refreshing the page or try again later.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={() => reset()} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
