import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('데모 계정 섹션을 노출하지 않는다', () => {
    render(<LoginPage onLogin={vi.fn()} />)

    expect(screen.queryByText('데모 계정')).not.toBeInTheDocument()
  })
})
