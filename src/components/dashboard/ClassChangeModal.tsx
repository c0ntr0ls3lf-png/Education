'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface CategoryOption {
  id: string
  name: string
}

interface ClassOption {
  id: string
  name: string
}

interface ClassChangeModalProps {
  trigger?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ClassChangeModal({ trigger, isOpen, onOpenChange }: ClassChangeModalProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [classOptions, setClassOptions] = useState<ClassOption[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [classesLoading, setClassesLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const isControlled = isOpen !== undefined && onOpenChange !== undefined
  const activeOpen = isControlled ? isOpen : open
  const activeSetOpen = isControlled ? onOpenChange : setOpen

  // Fetch categories on mount when modal opens
  useEffect(() => {
    if (activeOpen) {
      async function fetchCategories() {
        try {
          const res = await fetch('/api/categories')
          if (res.ok) {
            const data = await res.json()
            setCategories(Array.isArray(data) ? data : [])
          }
        } catch {
          // Silently fail
        } finally {
          setCategoriesLoading(false)
        }
      }
      fetchCategories()
    }
  }, [activeOpen])

  // Fetch classes when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setClassOptions([])
      return
    }
    async function fetchClasses() {
      setClassesLoading(true)
      try {
        const res = await fetch(`/api/classes?categoryId=${selectedCategory}`)
        if (res.ok) {
          const data = await res.json()
          setClassOptions(Array.isArray(data) ? data : [])
        }
      } catch {
        setClassOptions([])
      } finally {
        setClassesLoading(false)
      }
    }
    fetchClasses()
  }, [selectedCategory])

  const handleSubmit = async () => {
    if (!selectedCategory || !selectedClass) {
      toast({ title: 'Error', description: 'Please select both Category and Class', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'class_change',
          action: 'update',
          data: {
            newClassId: selectedClass,
            newCategoryId: selectedCategory,
          },
        }),
      })

      if (res.ok) {
        toast({
          title: 'Request Submitted',
          description: 'Your request for a class change has been sent to the Admin for approval.',
        })
        activeSetOpen(false)
        setSelectedCategory('')
        setSelectedClass('')
      } else {
        const errData = await res.json()
        toast({
          title: 'Submission Failed',
          description: errData.error || 'Could not submit request',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={activeOpen} onOpenChange={activeSetOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Class Change</DialogTitle>
          <DialogDescription>
            Choose your new category and class. Changes will be applied once approved by the administrator.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Category Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="change-category">New Category</Label>
            <Select value={selectedCategory} onValueChange={(val) => {
              setSelectedCategory(val)
              setSelectedClass('')
            }}>
              <SelectTrigger id="change-category">
                <SelectValue placeholder={categoriesLoading ? 'Loading categories...' : 'Select Category'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="change-class">New Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass} disabled={!selectedCategory}>
              <SelectTrigger id="change-class">
                <SelectValue placeholder={classesLoading ? 'Loading classes...' : !selectedCategory ? 'Select category first' : 'Select Class'} />
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => activeSetOpen(false)}>Cancel</Button>
          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedCategory || !selectedClass}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
