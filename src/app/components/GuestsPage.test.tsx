import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { format } from 'date-fns'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GuestsPage } from './GuestsPage'

const supabaseMocks = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}))

const toastMocks = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: supabaseMocks.mockFrom,
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: toastMocks.toastError,
    success: toastMocks.toastSuccess,
  },
}))

const buildUser = () => ({
  id: 'user-1',
  username: 'staffer',
  displayName: 'Staffer',
  role: 'STAFF' as const,
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
    order: vi.fn(() => builder),
    then: (resolve: (value: unknown) => void, reject: (reason?: any) => void) =>
      Promise.resolve(result).then(resolve, reject),
  }
  return builder
}

describe('GuestsPage', () => {
  afterEach(() => {
    supabaseMocks.mockFrom.mockReset()
    toastMocks.toastError.mockReset()
    toastMocks.toastSuccess.mockReset()
  })

  it('게스트 추가 시 Supabase insert를 호출한다', async () => {
    const businessDate = format(new Date(), 'yyyy-MM-dd')
    const fetchResult = { data: [], error: null }
    const insertResult = {
      data: {
        id: 'guest-1',
        guest_name: '김민수',
        phone: null,
        status: 'REGISTERED',
        created_by: 'user-1',
        created_by_profile: {
          display_name: '스태프',
          username: 'staffer',
        },
        business_date: businessDate,
      },
      error: null,
    }

    const selectSingle = vi.fn().mockResolvedValue(insertResult)
    const selectAfterInsert = vi.fn(() => ({ single: selectSingle }))
    const insert = vi.fn(() => ({ select: selectAfterInsert }))

    const builder = createBuilder(fetchResult)
    const select = vi.fn(() => builder)
    supabaseMocks.mockFrom.mockImplementation(() => ({
      select,
      insert,
    }))

    render(<GuestsPage user={buildUser()} />)

    await waitFor(() => {
      expect(select).toHaveBeenCalledWith(expect.stringContaining('created_by_profile'))
    })

    fireEvent.click(screen.getByRole('button', { name: '게스트 추가' }))
    fireEvent.change(screen.getByLabelText('이름 *'), { target: { value: '김민수' } })
    fireEvent.click(screen.getByRole('button', { name: '등록' }))

    await waitFor(() => {
      expect(insert).toHaveBeenCalled()
    })

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        guest_name: '김민수',
        guest_type: 'FREE',
        created_by: 'user-1',
        club_id: 'club-1',
        business_date: businessDate,
      }),
    )
    expect(toastMocks.toastSuccess).toHaveBeenCalledWith('게스트가 등록되었습니다')
  })
})
