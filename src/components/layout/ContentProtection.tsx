'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ContentProtection() {
  const pathname = usePathname()

  useEffect(() => {
    // ─── Disable protection entirely on admin routes ───
    if (pathname?.startsWith('/admin')) {
      return
    }

    // Add no-copy class to body
    document.body.classList.add('no-copy')

    // Helper: Allow standard interactions inside inputs, textareas and contenteditables
    const isInputElement = (target: any): boolean => {
      if (!target) return false
      const tagName = target.tagName
      return (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest?.('[contenteditable="true"]')
      )
    }

    // ─── Disable right-click ─────────────────────────────
    const handleContextMenu = (e: MouseEvent) => {
      if (isInputElement(e.target)) {
        return // Allow right-click in inputs/textareas
      }
      e.preventDefault()
      return false
    }

    // ─── Disable keyboard shortcuts ──────────────────────
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C / Ctrl+V / Ctrl+X — Copy/Paste/Cut
      const isCtrl = e.ctrlKey || e.metaKey

      if (isInputElement(e.target)) {
        // Still prevent DevTools (F12, Ctrl+Shift+I) and View Source (Ctrl+U)
        if (
          e.key === 'F12' ||
          (isCtrl && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
          (isCtrl && ['u', 'U'].includes(e.key))
        ) {
          e.preventDefault()
          return false
        }
        return // Allow normal keydown for inputs
      }

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
      if (isInputElement(e.target)) {
        return // Allow drag/drop text inside input fields
      }
      e.preventDefault()
      return false
    }

    // ─── Disable copy event itself ───────────────────────
    const handleCopy = (e: ClipboardEvent) => {
      if (isInputElement(e.target)) {
        return // Allow copying text out of input fields
      }
      e.preventDefault()
      return false
    }

    // ─── Attempt to disable PrintScreen ─────────────────
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
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
  }, [pathname])

  // This component doesn't render anything visible
  return null
}
