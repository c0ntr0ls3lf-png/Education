'use client'

import { useEffect } from 'react'

/**
 * ExtensionErrorSuppressor: Prevents third-party Chrome extensions
 * (like adblockers, automation tools, or password managers) from throwing unhandled rejections
 * that trigger the Next.js Dev Overlay (red screen of death) during development.
 */
export default function ExtensionErrorSuppressor() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleExtensionErrors = (event: ErrorEvent | PromiseRejectionEvent) => {
      // Safely inspect error parameters to identify extension-based rejections
      const filename = (event as ErrorEvent).filename || ''
      const message = (event as ErrorEvent).message || ''
      const reasonStr = String((event as PromiseRejectionEvent).reason || '')
      const stack = (event as PromiseRejectionEvent).reason?.stack || ''

      const isExtensionError =
        filename.includes('chrome-extension://') ||
        message.includes('M_ID') ||
        message.includes('chrome-extension') ||
        reasonStr.includes('M_ID') ||
        reasonStr.includes('chrome-extension') ||
        stack.includes('chrome-extension://') ||
        stack.includes('eppiocemhmnlbhjplcgkofciiegomcon')

      if (isExtensionError) {
        // Prevent event propagation so Next.js Dev Overlay doesn't catch it
        event.stopImmediatePropagation()
        event.preventDefault()
        console.warn('⚠️ Suppressed third-party browser extension error to prevent Dev Overlay crash:', message || reasonStr)
      }
    }

    // Register listeners during capture phase to intercept before Next.js Dev Overlay
    window.addEventListener('error', handleExtensionErrors, true)
    window.addEventListener('unhandledrejection', handleExtensionErrors, true)

    return () => {
      window.removeEventListener('error', handleExtensionErrors, true)
      window.removeEventListener('unhandledrejection', handleExtensionErrors, true)
    }
  }, [])

  return null
}
