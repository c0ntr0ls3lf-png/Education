'use client'

import { useState, useEffect, useCallback } from 'react'
import { Quote } from 'lucide-react'

interface QuoteItem {
  id: string
  text: string
  author: string | null
}

export default function TypingQuotes() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/quotes')
      .then((res) => res.json())
      .then((data) => {
        const quoteArray = Array.isArray(data) ? data : []
        setQuotes(quoteArray)
        setIsLoading(false)
        if (quoteArray.length > 0) {
          setCurrentIndex(Math.floor(Math.random() * quoteArray.length))
        }
      })
      .catch(() => setIsLoading(false))
  }, [])

  const typeSpeed = 60
  const deleteSpeed = 30
  const pauseDuration = 4000

  const typeText = useCallback(() => {
    if (quotes.length === 0) return

    const fullText = quotes[currentIndex].text
    let charIndex = 0
    setIsTyping(true)

    const typeInterval = setInterval(() => {
      if (charIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, charIndex))
        charIndex++
      } else {
        clearInterval(typeInterval)
        setTimeout(() => {
          deleteText(fullText)
        }, pauseDuration)
      }
    }, typeSpeed)

    return () => clearInterval(typeInterval)
  }, [quotes, currentIndex])

  const deleteText = useCallback((fullText: string) => {
    let charIndex = fullText.length
    setIsTyping(false)

    const deleteInterval = setInterval(() => {
      if (charIndex >= 0) {
        setDisplayText(fullText.slice(0, charIndex))
        charIndex--
      } else {
        clearInterval(deleteInterval)
        setCurrentIndex((prev) => {
          let next = Math.floor(Math.random() * quotes.length)
          while (quotes.length > 1 && next === prev) {
            next = Math.floor(Math.random() * quotes.length)
          }
          return next
        })
      }
    }, deleteSpeed)

    return () => clearInterval(deleteInterval)
  }, [quotes.length])

  useEffect(() => {
    if (quotes.length === 0) return
    const cleanup = typeText()
    return cleanup
  }, [currentIndex, quotes.length, typeText])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-w-0 px-4">
        <div className="h-5 w-48 bg-muted/50 rounded animate-pulse" />
      </div>
    )
  }

  if (quotes.length === 0) {
    return null
  }

  const currentQuote = quotes[currentIndex]

  if (!currentQuote) {
    return null
  }

  return (
    <div className="flex-1 flex items-center justify-center min-w-0 px-4">
      <div className="flex flex-col items-center max-w-2xl w-full text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <Quote className="inline-block h-3.5 w-3.5 text-emerald-500 mr-1 opacity-70" />
          {displayText}
          <span className="inline-block w-0.5 h-4 bg-emerald-500 ml-0.5 align-middle animate-pulse" />
        </p>
        <p className={`text-xs text-gray-400 dark:text-gray-500 mt-1 transition-opacity duration-300 ${
          currentQuote.author && displayText.length === currentQuote.text.length ? 'opacity-100' : 'opacity-0'
        }`}>
          — {currentQuote.author || ' '}
        </p>
      </div>
    </div>
  )
}
