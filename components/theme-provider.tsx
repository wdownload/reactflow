"use client"

import * as React from "react"
import { ThemeProvider as NextThemeProvider, type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      enableSystem
      defaultTheme="system"
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemeProvider>
  )
}
