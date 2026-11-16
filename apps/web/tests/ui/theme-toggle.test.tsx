import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ThemeToggle from '@/ui/components/ThemeToggle'

describe('ThemeToggle', () => {
  it('defaults to my-app-light and toggles to my-app-dark, persisting to localStorage', () => {
    render(<ThemeToggle />)

    expect(document.documentElement.getAttribute('data-theme')).toBe('my-app-light')

    fireEvent.click(screen.getByRole('button'))

    expect(document.documentElement.getAttribute('data-theme')).toBe('my-app-dark')
    expect(localStorage.getItem('theme')).toBe('my-app-dark')

    fireEvent.click(screen.getByRole('button'))

    expect(document.documentElement.getAttribute('data-theme')).toBe('my-app-light')
    expect(localStorage.getItem('theme')).toBe('my-app-light')
  })

  it('restores a saved theme from localStorage on mount', () => {
    localStorage.setItem('theme', 'my-app-dark')
    render(<ThemeToggle />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('my-app-dark')
  })

  it('ignores an unknown stored theme instead of desyncing from the DOM', () => {
    localStorage.setItem('theme', 'some-old-theme')
    render(<ThemeToggle />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('my-app-light')
    expect(localStorage.getItem('theme')).toBe('my-app-light')
  })
})
