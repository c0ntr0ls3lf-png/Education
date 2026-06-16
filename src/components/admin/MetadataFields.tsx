'use client'

import { useState, useEffect, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Plus, Check, Search } from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

export type SourceType = 'board' | 'school' | 'model_test' | 'custom'

const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: 'board', label: 'Board' },
  { value: 'school', label: 'School' },
  { value: 'model_test', label: 'Model Test' },
  { value: 'custom', label: 'Custom' },
]

const DEFAULT_BOARDS = [
  'Dhaka Board',
  'Rajshahi Board',
  'Cumilla Board',
  'Chittagong Board',
  'Barisal Board',
  'Sylhet Board',
  'Jessore Board',
  'Dinajpur Board',
  'Mymensingh Board',
]

interface MetadataFieldsProps {
  board_name: string
  exam_year: string
  sourceType: SourceType
  onChange: (field: 'board_name' | 'exam_year' | 'sourceType', value: string) => void
}

export default function MetadataFields({ board_name, exam_year, sourceType, onChange }: MetadataFieldsProps) {
  const [boardOptions, setBoardOptions] = useState<string[]>(DEFAULT_BOARDS)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch existing boards from database to enrich options list
  useEffect(() => {
    async function fetchBoards() {
      try {
        const res = await fetch('/api/questions/filters')
        if (res.ok) {
          const data = await res.json()
          const dbBoards = data.boards || []
          const combined = new Set([...DEFAULT_BOARDS, ...dbBoards])
          setBoardOptions(Array.from(combined))
        }
      } catch (err) {
        console.error('Failed to load DB boards in admin:', err)
      }
    }
    fetchBoards()
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredBoards = boardOptions.filter((b) =>
    b.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const showAddCustom =
    searchQuery.trim().length > 0 &&
    !boardOptions.some((b) => b.toLowerCase() === searchQuery.trim().toLowerCase())

  const handleSelectBoard = (board: string) => {
    onChange('board_name', board)
    setSearchQuery('')
    setDropdownOpen(false)
    setIsAddingCustom(false)
  }

  const handleAddCustomBoard = () => {
    const newBoard = searchQuery.trim()
    if (newBoard) {
      setBoardOptions((prev) => Array.from(new Set([...prev, newBoard])))
      handleSelectBoard(newBoard)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Searchable Board Name Dropdown */}
      <div className="space-y-1.5 relative" ref={dropdownRef}>
        <Label className="text-xs font-medium text-muted-foreground">Board / School Name</Label>
        
        {isAddingCustom ? (
          <div className="flex gap-1.5">
            <Input
              className="h-9 text-sm"
              placeholder="Enter custom board name..."
              value={board_name || ''}
              onChange={(e) => onChange('board_name', e.target.value)}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-2.5 text-xs font-semibold rounded-lg border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="relative">
            <Input
              className="h-9 text-sm pr-8"
              placeholder="Search or select board..."
              value={dropdownOpen ? searchQuery : (board_name || '')}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setDropdownOpen(true)
              }}
              onFocus={() => {
                setSearchQuery('')
                setDropdownOpen(true)
              }}
            />
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Dropdown Options */}
        {dropdownOpen && !isAddingCustom && (
          <div className="absolute left-0 right-0 mt-1.5 rounded-xl border bg-popover text-popover-foreground shadow-lg z-50 overflow-hidden max-h-56 overflow-y-auto">
            <div className="p-1 space-y-0.5">
              {filteredBoards.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleSelectBoard(b)}
                  className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium hover:bg-accent transition-colors"
                >
                  <span>{b}</span>
                  {board_name === b && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                </button>
              ))}

              {filteredBoards.length === 0 && !showAddCustom && (
                <div className="py-2 text-center text-xs text-muted-foreground italic">
                  No matches found
                </div>
              )}

              {/* Add Custom Board option */}
              {showAddCustom && (
                <button
                  type="button"
                  onClick={handleAddCustomBoard}
                  className="flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors border-t border-muted/50 mt-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add &quot;{searchQuery}&quot; as new board</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsAddingCustom(true)
                  onChange('board_name', '')
                  setDropdownOpen(false)
                }}
                className="flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold text-primary hover:bg-accent transition-colors border-t border-muted/50 mt-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Custom Entry Manually</span>
              </button>
            </div>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground">Searchable — supports adding future boards dynamically</p>
      </div>

      {/* Year */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Year</Label>
        <Input
          type="number"
          className="h-9 text-sm"
          placeholder="2024"
          min={1900}
          max={2100}
          value={exam_year || ''}
          onChange={(e) => onChange('exam_year', e.target.value)}
        />
        <p className="text-[10px] text-muted-foreground">Optional — defaults to current year if empty</p>
      </div>

      {/* Source Type */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Source Type</Label>
        <Select value={sourceType || 'custom'} onValueChange={(v) => onChange('sourceType', v as SourceType)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select source type" />
          </SelectTrigger>
          <SelectContent>
            {SOURCE_TYPES.map((st) => (
              <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground">Required — Board, School, Model Test, or Custom</p>
      </div>
    </div>
  )
}
