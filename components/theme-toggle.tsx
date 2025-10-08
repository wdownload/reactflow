"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  const icon = isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2"
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {mounted ? icon : <Moon className="h-4 w-4" />}
      <span className="hidden text-xs font-medium sm:inline">
        {mounted ? (isDark ? "Light" : "Dark") : "Theme"}
      </span>
    </Button>
  )
}
