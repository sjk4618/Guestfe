import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminDashboard } from './AdminDashboard'

const supabaseMocks = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: supabaseMocks.mockFrom,
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

const buildUser = () => ({
  id: 'admin-1',
  username: 'admin',
  displayName: 'Admin',
  role: 'ADMIN' as const,
  clubId: 'club-1',
  clubName: 'Club',
  clubSlug: 'club',
  cutoffHour: 0,
  cutoffMinute: 0,
  isActive: true,
})

const createBuilder = (result: unknown) => {
  const builder: any = {
    eq: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    then: (resolve: (value: unknown) => void, reject: (reason?: any) => void) =>
      Promise.resolve(result).then(resolve, reject),
  }
  return builder
}

describe('AdminDashboard', () => {
  it('Supabase 데이터를 KPI에 반영한다', async () => {
    const fetchResult = {
      data: [
        {
          id: 'guest-1',
          status: 'REGISTERED',
          guest_type: 'FREE',
          business_date: '2025-01-05',
          checked_in_at: null,
          created_by: 'user-1',
          created_by_profile: { display_name: '스태프' },
        },
        {
          id: 'guest-2',
          status: 'CHECKED_IN',
          guest_type: 'PAID',
          business_date: '2025-01-05',
          checked_in_at: new Date().toISOString(),
          created_by: 'user-2',
          created_by_profile: { display_name: '프로모터' },
        },
      ],
      error: null,
    }

    const builder = createBuilder(fetchResult)
    const select = vi.fn(() => builder)
    supabaseMocks.mockFrom.mockImplementation(() => ({
      select,
    }))

    render(<AdminDashboard user={buildUser()} />)

    await waitFor(() => {
      expect(select).toHaveBeenCalled()
    })

    const totalCard = screen.getByText('총 등록').closest('[data-slot="card"]')
    const checkedCard = screen.getByText('총 입장').closest('[data-slot="card"]')

    if (!totalCard || !checkedCard) {
      throw new Error('KPI 카드가 없습니다.')
    }

    expect(within(totalCard).getByText('2')).toBeInTheDocument()
    expect(within(checkedCard).getByText('1')).toBeInTheDocument()
  })
})
