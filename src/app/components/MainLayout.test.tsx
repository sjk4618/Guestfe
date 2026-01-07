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

const buildUser = (role: 'ADMIN' | 'STAFF') => ({
  id: 'user-1',
  username: 'tester',
  displayName: 'Tester',
  role,
  clubId: 'club-1',
  clubName: 'Club',
  clubSlug: 'club',
  cutoffHour: 0,
  cutoffMinute: 0,
  isActive: true,
})

describe('MainLayout', () => {
  it('데모 역할 전환 UI를 노출하지 않는다', () => {
    render(<MainLayout user={buildUser('ADMIN')} onLogout={vi.fn()} />)

    expect(screen.queryByText('데모 역할 전환')).not.toBeInTheDocument()
  })
})
