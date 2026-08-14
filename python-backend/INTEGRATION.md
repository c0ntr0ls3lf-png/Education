# 📚 Integration Guide - Add AI Solver to Your Chapter Page

## Quick Start: Add to Chapter Page

### 1. Update Chapter Page Component

Edit your chapter page to include the AI solver:

**File:** `src/app/class/[slug]/page.tsx` (or wherever your chapter is)

```tsx
'use client';

import { AIImageSolver } from '@/components/admin/AIImageSolver';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ChapterPage() {
  const [solutions, setSolutions] = useState<any[]>([]);

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="main-book" className="w-full">
        <TabsList>
          <TabsTrigger value="main-book">Main Book</TabsTrigger>
          <TabsTrigger value="mcq">MCQ</TabsTrigger>
          <TabsTrigger value="creative">Creative Questions</TabsTrigger>
          <TabsTrigger value="ai-solver">AI Problem Solver ✨</TabsTrigger>
        </TabsList>

        {/* Your existing tabs */}
        <TabsContent value="main-book">
          {/* Main book content */}
        </TabsContent>

        <TabsContent value="mcq">
          {/* MCQ content */}
        </TabsContent>

        <TabsContent value="creative">
          {/* Creative questions */}
        </TabsContent>

        {/* NEW: AI Problem Solver Tab */}
        <TabsContent value="ai-solver" className="space-y-4">
          <AIImageSolver 
            onSolve={(result) => {
              setSolutions([...solutions, result]);
              console.log('Solution received:', result);
            }}
          />

          {/* Show previous solutions */}
          {solutions.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-bold">Previous Solutions</h3>
              {solutions.map((sol, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500"
                >
                  <p className="text-sm text-gray-500">
                    Solved by: <span className="font-semibold">{sol.provider}</span>
                  </p>
                  <p className="mt-2">{sol.answer}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Advanced: Customize the Component

### 1. With Custom Styling

```tsx
<AIImageSolver 
  onSolve={(result) => {
    // Handle solution
    toast.success(`Solved by ${result.provider}`);
  }}
/>
```

### 2. With Error Handling

```tsx
'use client';

import { AIImageSolver } from '@/components/admin/AIImageSolver';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ChapterWithAI() {
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = (result: any) => {
    setIsSolving(false);
    
    if (result.success) {
      setError(null);
      toast.success(`Solved by ${result.provider}`);
      // Save to database
      saveSolution(result);
    } else {
      setError('Could not solve the problem');
      toast.error('Failed to solve');
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <AIImageSolver onSolve={handleSolve} />
    </div>
  );
}
```

### 3. With Database Integration

```tsx
'use client';

import { AIImageSolver } from '@/components/admin/AIImageSolver';
import { useMutation } from '@tanstack/react-query';

export default function ChapterWithDB() {
  const saveSolutionMutation = useMutation({
    mutationFn: async (solution: any) => {
      const response = await fetch('/api/solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: params.chapterId,
          problem: solution.problem,
          answer: solution.answer,
          provider: solution.provider,
          processingTime: solution.processing_time,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast.success('Solution saved!');
    },
  });

  return (
    <AIImageSolver 
      onSolve={(result) => {
        if (result.success) {
          saveSolutionMutation.mutate(result);
        }
      }}
    />
  );
}
```

## Create API Endpoint for Solutions

Create **`src/app/api/solutions/route.ts`**:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Save to MongoDB
    const solution = await db.solutions.create({
      chapterId: data.chapterId,
      problem: data.problem,
      answer: data.answer,
      provider: data.provider,
      processingTime: data.processingTime,
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      solutionId: solution._id 
    });
  } catch (error) {
    console.error('Error saving solution:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get solutions for a chapter
export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get('chapterId');

  const solutions = await db.solutions.find({ chapterId });
  return NextResponse.json(solutions);
}
```

## Environment Variables for Frontend

Add to **`.env.local`**:

```bash
# Python Backend URL
NEXT_PUBLIC_PYTHON_BACKEND_URL=http://localhost:8000

# Or for production:
# NEXT_PUBLIC_PYTHON_BACKEND_URL=https://api.yourdomain.com
```

Update component to use:

```tsx
const BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'http://localhost:8000';

const response = await fetch(`${BACKEND_URL}/api/solve-problem`, {
  // ...
});
```

## Advanced: Real-time Streaming

Create **`src/components/admin/AIImageSolverStream.tsx`**:

```tsx
'use client';

import { useState } from 'react';

export const AIImageSolverStream: React.FC = () => {
  const [answer, setAnswer] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const streamSolution = async (prompt: string, imageBase64?: string) => {
    setIsStreaming(true);
    setAnswer('');

    try {
      const response = await fetch(
        'http://localhost:8000/api/solve-problem-stream',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, image_base64: imageBase64 }),
        }
      );

      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        setAnswer((prev) => prev + chunk);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div>
      {/* Stream solution in real-time */}
      {answer && (
        <div className="bg-white p-4 rounded-lg">
          {answer}
          {isStreaming && <span className="animate-pulse">▌</span>}
        </div>
      )}
    </div>
  );
};
```

## Add to Multiple Pages

### Pattern 1: Reusable Hook

Create **`src/hooks/useAISolver.ts`**:

```typescript
'use client';

import { useState } from 'react';

export function useAISolver() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const solveProblem = async (prompt: string, imageBase64?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/solve-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, image_base64: imageBase64 }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error('Failed to solve');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { solveProblem, loading, error };
}
```

Use in any component:

```tsx
import { useAISolver } from '@/hooks/useAISolver';

export function MyPage() {
  const { solveProblem, loading, error } = useAISolver();

  const handleSolve = async () => {
    try {
      const result = await solveProblem('2x + 5 = 15');
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button onClick={handleSolve} disabled={loading}>
      {loading ? 'Solving...' : 'Solve'}
    </button>
  );
}
```

## Analytics & Tracking

Create **`src/lib/analytics.ts`**:

```typescript
export async function trackSolution(solution: any) {
  await fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({
      event: 'problem_solved',
      provider: solution.provider,
      processingTime: solution.processing_time,
      cached: solution.cached,
      success: solution.success,
      timestamp: new Date(),
    }),
  });
}
```

Use in component:

```tsx
import { trackSolution } from '@/lib/analytics';

<AIImageSolver 
  onSolve={(result) => {
    trackSolution(result);
  }}
/>
```

## Performance Tips

1. **Lazy load the component**
   ```tsx
   const AIImageSolver = dynamic(
     () => import('@/components/admin/AIImageSolver'),
     { loading: () => <p>Loading...</p> }
   );
   ```

2. **Cache results in browser**
   ```tsx
   const cache = new Map();
   
   if (cache.has(prompt)) {
     return cache.get(prompt);
   }
   ```

3. **Preload Python backend**
   ```tsx
   useEffect(() => {
     fetch('http://localhost:8000/health'); // Warmup
   }, []);
   ```

4. **Debounce image uploads**
   ```tsx
   const debouncedUpload = useCallback(
     debounce((file) => uploadImage(file), 500),
     []
   );
   ```

## Testing

Create **`__tests__/AIImageSolver.test.tsx`**:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AIImageSolver } from '@/components/admin/AIImageSolver';

describe('AIImageSolver', () => {
  it('renders upload button', () => {
    render(<AIImageSolver />);
    expect(screen.getByText('Upload Image')).toBeInTheDocument();
  });

  it('handles image upload', async () => {
    render(<AIImageSolver />);
    const input = screen.getByDisplayValue('');
    // ... test upload
  });
});
```

## Mobile Optimization

Ensure mobile-friendly design:

```tsx
export const AIImageSolver: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto sm:p-2 md:p-4">
      {/* Responsive design */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button className="flex-1">Upload</button>
        <button className="flex-1">Camera</button>
      </div>
    </div>
  );
};
```

## Troubleshooting

### CORS Error
Add to backend `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Image Upload Failed
- Check file size limit
- Verify format (jpg, png, webp)
- Check backend logs

### Camera Not Working
- Use HTTPS (https required in production)
- Check browser permissions
- Works on localhost

## Next Steps

1. ✅ Add component to chapter page
2. ✅ Test in development
3. ✅ Add database integration
4. ✅ Deploy backend
5. ✅ Update environment variables
6. ✅ Test in production
7. ✅ Monitor usage

Happy coding! 🚀
