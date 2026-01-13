import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Toaster } from './sonner'

const sonnerMocks = vi.hoisted(() => ({
  props: null as Record<string, unknown> | null,
}))

vi.mock('sonner', () => ({
  Toaster: (props: Record<string, unknown>) => {
    sonnerMocks.props = props
    return null
  },
}))

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' }),
}))

describe('Toaster', () => {
  afterEach(() => {
    cleanup()
    sonnerMocks.props = null
  })

  it('기본 위치를 top-center로 설정한다', () => {
    render(<Toaster />)

    expect(sonnerMocks.props?.position).toBe('top-center')
  })

  it('position prop을 전달하면 반영한다', () => {
    render(<Toaster position="top-center" />)

    expect(sonnerMocks.props?.position).toBe('top-center')
  })
})
