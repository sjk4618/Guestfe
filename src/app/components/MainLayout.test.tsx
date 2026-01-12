import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MainLayout } from './MainLayout'

vi.mock('./GuestsPage', () => ({
  GuestsPage: () => <div>Guests</div>,
}))

vi.mock('./DoorPage', () => ({
  DoorPage: () => <div>Door</div>,
}))

vi.mock('./AdminDashboard', () => ({
  AdminDashboard: () => <div>Dashboard</div>,
}))

vi.mock('./AdminStaffPage', () => ({
  AdminStaffPage: () => <div>Staff</div>,
}))

vi.mock('./AdminSettingsPage', () => ({
  AdminSettingsPage: () => <div>Settings</div>,
}))

const buildUser = (role: 'ADMIN' | 'STAFF', clubImageUrl: string | null = 'https://example.com/logo.png') => ({
  id: 'user-1',
  username: 'tester',
  displayName: 'Tester',
  role,
  clubId: 'club-1',
  clubName: 'Club',
  clubSlug: 'club',
  clubImageUrl,
  cutoffHour: 0,
  cutoffMinute: 0,
  dailyGuestLimit: null,
  isActive: true,
})

describe('MainLayout', () => {
  it('데모 역할 전환 UI를 노출하지 않는다', () => {
    render(<MainLayout user={buildUser('ADMIN')} onLogout={vi.fn()} />)

    expect(screen.queryByText('데모 역할 전환')).not.toBeInTheDocument()
  })

  it('클럽 로고를 헤더에서 렌더링한다', () => {
    render(<MainLayout user={buildUser('ADMIN', 'https://example.com/logo.png')} onLogout={vi.fn()} />)

    const logos = screen.getAllByAltText('Club 로고')
    expect(logos.length).toBeGreaterThan(0)
  })

  it('로고가 없을 때 이니셜을 표시한다', () => {
    render(<MainLayout user={buildUser('ADMIN', null)} onLogout={vi.fn()} />)

    const fallbacks = screen.getAllByText('C')
    expect(fallbacks.length).toBeGreaterThan(0)
  })

  it('이름과 권한을 노출한다', () => {
    render(<MainLayout user={buildUser('ADMIN')} onLogout={vi.fn()} />)

    expect(screen.getAllByText('Tester').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ADMIN').length).toBeGreaterThan(0)
  })
})
