'use client'

import { useEffect, useRef } from 'react'
import katex from 'katex'

interface MathRendererProps {
  content: string
  className?: string
}

export function MathRenderer({ content, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !content) return

    const renderMath = (text: string): string => {
      // 1. Handle block math $$...$$
      let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, formula) => {
        try {
          return katex.renderToString(formula.trim(), {
            displayMode: true,
            throwOnError: false,
            strict: false,
          })
        } catch {
          return `<span class="text-red-500">[Math Error: ${formula}]</span>`
        }
      })

      // 1b. Handle block math \[...\]
      result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_match, formula) => {
        try {
          return katex.renderToString(formula.trim(), {
            displayMode: true,
            throwOnError: false,
            strict: false,
          })
        } catch {
          return `<span class="text-red-500">[Math Error: ${formula}]</span>`
        }
      })

      // 2. Handle inline math $...$
      result = result.replace(/\$([^\$]+?)\$/g, (_match, formula) => {
        try {
          return katex.renderToString(formula.trim(), {
            displayMode: false,
            throwOnError: false,
            strict: false,
          })
        } catch {
          return `<span class="text-red-500">[Math Error: ${formula}]</span>`
        }
      })

      // 2b. Handle inline math \(...\)
      result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_match, formula) => {
        try {
          return katex.renderToString(formula.trim(), {
            displayMode: false,
            throwOnError: false,
            strict: false,
          })
        } catch {
          return `<span class="text-red-500">[Math Error: ${formula}]</span>`
        }
      })

      return result
    }

    const rendered = renderMath(content)
    containerRef.current.innerHTML = rendered
  }, [content])

  return (
    <div
      ref={containerRef}
      className={`math-content whitespace-pre-wrap ${className}`}
      dir="auto"
    />
  )
}
