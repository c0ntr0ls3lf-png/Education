'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string') {
      // Suppress 'Encountered a script tag' errors
      if (args[0].includes('Encountered a script tag')) {
        return
      }
      // Suppress hydration mismatch warnings (caused by browser extensions like
      // Bis that add extra attributes to the DOM)
      if (args[0].includes('hydrat') || args[0].includes('did not match')) {
        return
      }
    }
    orig.apply(console, args)
  }
}

export function ThemeProvider({ children, ...props }: any) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
