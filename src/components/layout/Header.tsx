'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Search,
  Moon,
  Sun,
  Menu,
  User,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  BookOpen,
  ClipboardList,
  Home,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import TypingQuotes from './TypingQuotes'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/class', label: 'Classes', icon: BookOpen },
  { href: '/exam', label: 'Exams', icon: ClipboardList },
]

interface UserData {
  id: string
  name?: string
  email: string
  image?: string
  role: string
  provider?: string
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem('eduUser')
        if (stored) {
          setUser(JSON.parse(stored))
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
    }

    checkUser()
    window.addEventListener('storage', checkUser)
    const interval = setInterval(checkUser, 2000)

    return () => {
      window.removeEventListener('storage', checkUser)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/class?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('eduUser')
    setUser(null)
    window.location.href = '/'
  }

  const userName = user?.name || user?.email?.split('@')[0] || 'User'
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm'
          : 'bg-white dark:bg-gray-950'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative bg-emerald-600 text-white p-2 rounded-lg group-hover:bg-emerald-500 transition-colors">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Edu<span className="text-emerald-600 dark:text-emerald-400">LMS</span>
            </span>
          </Link>

          {/* Center: Typing Quotes */}
          <div className="hidden md:flex flex-1 items-center justify-center min-w-0">
            <TypingQuotes />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            {/* Auth / User Menu (Desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-1.5 px-2 h-9 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.image} alt={userName} />
                        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                    <LogIn className="h-4 w-4 mr-1.5" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-gray-600 dark:text-gray-300"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <span className="text-gray-900 dark:text-white">
                      Edu<span className="text-emerald-600">LMS</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  {/* User Info (Mobile) */}
                  {user && (
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image} alt={userName} />
                        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </form>

                  {/* Mobile Nav Links */}
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      </SheetClose>
                    )
                  })}

                  <div className="my-4 border-t" />

                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors">
                          <LayoutDashboard className="h-5 w-5" />
                          Dashboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors">
                          <User className="h-5 w-5" />
                          Profile
                        </Link>
                      </SheetClose>
                      <div className="my-4 border-t" />
                      <Button
                        variant="outline"
                        className="w-full h-10 font-medium border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link href="/login" className="w-full">
                          <Button variant="outline" className="w-full h-10 font-medium border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                            <LogIn className="h-4 w-4 mr-2" />
                            Sign In
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/register" className="w-full">
                          <Button className="w-full h-10 font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Get Started
                          </Button>
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
