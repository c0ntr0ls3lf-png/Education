'use client'

import { useEffect } from 'react'

export default function ContentProtection() {
  useEffect(() => {
    // Add no-copy class to body
    document.body.classList.add('no-copy')

    // ─── Disable right-click ─────────────────────────────
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // ─── Disable keyboard shortcuts ──────────────────────
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C / Cmd+C — Copy
      // Ctrl+V / Cmd+V — Paste
      // Ctrl+U — View Source
      // Ctrl+S — Save Page
      // Ctrl+P — Print
      // Ctrl+Shift+I — DevTools
      // Ctrl+Shift+J — Console
      // Ctrl+Shift+C — Inspect
      // F12 — DevTools
      // PrintScreen — handled below

      const isCtrl = e.ctrlKey || e.metaKey

      if (
        e.key === 'F12' ||
        (isCtrl && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (isCtrl && ['u', 'U', 's', 'S', 'p', 'P', 'c', 'C', 'v', 'V'].includes(e.key))
      ) {
        e.preventDefault()
        return false
      }
    }

    // ─── Disable drag (text/images) ──────────────────────
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // ─── Disable copy event itself ───────────────────────
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      return false
    }

    // ─── Attempt to disable PrintScreen ─────────────────
    // Note: PrintScreen can't be fully prevented in JS,
    // but we can try to clear the clipboard after copy
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        // Clear clipboard if possible (may not work in all browsers)
        try {
          navigator.clipboard?.writeText('')
        } catch { /* silently fail */ }
      }
    }

    // Add all event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('copy', handleCopy, true)

    // ─── Cleanup ─────────────────────────────────────────
    return () => {
      document.body.classList.remove('no-copy')
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('copy', handleCopy, true)
    }
  }, [])

  // This component doesn't render anything visible
  return null
}
