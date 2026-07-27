import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
  clubImageUrl: null,
  cutoffHour: 0,
  cutoffMinute: 0,
  dailyGuestLimit: null,
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
    cleanup()
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
          deleted_at: null,
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

  it('일일 한도에 도달하면 추가를 막는다', async () => {
    const businessDate = format(new Date(), 'yyyy-MM-dd')
    const fetchResult = {
      data: [
        {
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
      ],
      error: null,
    }
    const countResult = { count: 1, error: null, data: null }

    const fetchBuilder = createBuilder(fetchResult)
    const countBuilder = createBuilder(countResult)
    const select = vi.fn((_: unknown, options?: { head?: boolean }) =>
      options?.head ? countBuilder : fetchBuilder,
    )
    const insert = vi.fn()

    supabaseMocks.mockFrom.mockImplementation(() => ({
      select,
      insert,
    }))

    render(<GuestsPage user={{ ...buildUser(), dailyGuestLimit: 1 }} />)

    await waitFor(() => {
      expect(select).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole('button', { name: '게스트 추가' }))
    fireEvent.change(screen.getByLabelText('이름 *'), { target: { value: '새 게스트' } })
    fireEvent.click(screen.getByRole('button', { name: '등록' }))

    await waitFor(() => {
      expect(toastMocks.toastError).toHaveBeenCalledWith(
        '하루 등록 가능 인원(1명)을 초과할 수 없습니다.',
      )
    })
    expect(insert).not.toHaveBeenCalled()
  })

  it('서버에서 한도 초과 오류가 오면 안내 메시지를 표시한다', async () => {
    const businessDate = format(new Date(), 'yyyy-MM-dd')
    const fetchResult = { data: [], error: null }
    const countResult = { count: 1, error: null, data: null }
    const insertResult = {
      data: null,
      error: { message: 'daily_guest_limit_exceeded', code: 'P0001' },
    }

    const fetchBuilder = createBuilder(fetchResult)
    const countBuilder = createBuilder(countResult)
    const select = vi.fn((_: unknown, options?: { head?: boolean }) =>
      options?.head ? countBuilder : fetchBuilder,
    )
    const selectSingle = vi.fn().mockResolvedValue(insertResult)
    const selectAfterInsert = vi.fn(() => ({ single: selectSingle }))
    const insert = vi.fn(() => ({ select: selectAfterInsert }))

    supabaseMocks.mockFrom.mockImplementation(() => ({
      select,
      insert,
    }))

    render(<GuestsPage user={{ ...buildUser(), dailyGuestLimit: 2 }} />)

    await waitFor(() => {
      expect(select).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole('button', { name: '게스트 추가' }))
    fireEvent.change(screen.getByLabelText('이름 *'), { target: { value: '새 게스트' } })
    fireEvent.click(screen.getByRole('button', { name: '등록' }))

    await waitFor(() => {
      expect(toastMocks.toastError).toHaveBeenCalledWith(
        '하루 등록 가능 인원(2명)을 초과할 수 없습니다.',
      )
    })
    expect(insert).toHaveBeenCalled()
  })

  it('삭제 후에는 한도 아래로 내려가 다시 추가할 수 있다', async () => {
    const businessDate = format(new Date(), 'yyyy-MM-dd')
    const fetchResult = {
      data: [
        {
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
      ],
      error: null,
    }
    const countResult = { count: 1, error: null, data: null }
    const insertResult = {
      data: {
        id: 'guest-2',
        guest_name: '새 게스트',
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

    const countAfterDeleteResult = { count: 0, error: null, data: null }

    const fetchBuilder = createBuilder(fetchResult)
    const countBuilder = createBuilder(countResult)
    const countAfterDeleteBuilder = createBuilder(countAfterDeleteResult)
    let deleted = false
    const select = vi.fn((_: unknown, options?: { head?: boolean }) => {
      if (!options?.head) return fetchBuilder
      return deleted ? countAfterDeleteBuilder : countBuilder
    })

    const deleteBuilder: any = {
      eq: vi.fn(() => deleteBuilder),
      then: (resolve: (value: unknown) => void, reject: (reason?: any) => void) =>
        Promise.resolve({ data: null, error: null }).then(resolve, reject),
    }
    const deleteFn = vi.fn(() => deleteBuilder)

    const selectSingle = vi.fn().mockResolvedValue(insertResult)
    const selectAfterInsert = vi.fn(() => ({ single: selectSingle }))
    const insert = vi.fn(() => ({ select: selectAfterInsert }))

    supabaseMocks.mockFrom.mockImplementation(() => ({
      select,
      insert,
      delete: deleteFn,
    }))

    render(<GuestsPage user={{ ...buildUser(), dailyGuestLimit: 1 }} />)

    await waitFor(() => {
      expect(select).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole('button', { name: '게스트 추가' }))
    fireEvent.change(screen.getByLabelText('이름 *'), { target: { value: '새 게스트' } })
    fireEvent.click(screen.getByRole('button', { name: '등록' }))

    await waitFor(() => {
      expect(toastMocks.toastError).toHaveBeenCalledWith(
        '하루 등록 가능 인원(1명)을 초과할 수 없습니다.',
      )
    })
    expect(insert).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: '취소' }))

    fireEvent.click(screen.getByRole('button', { name: '게스트 삭제' }))

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
    deleted = true

    fireEvent.click(screen.getByRole('button', { name: '게스트 추가' }))
    fireEvent.change(screen.getByLabelText('이름 *'), { target: { value: '새 게스트' } })
    fireEvent.click(screen.getByRole('button', { name: '등록' }))

    await waitFor(() => {
      expect(insert).toHaveBeenCalled()
    })
  })

  it('삭제된 스태프가 등록한 게스트는 "이름 (삭제된 스태프)"로 표시된다', async () => {
    const businessDate = format(new Date(), 'yyyy-MM-dd')
    const fetchResult = {
      data: [
        {
          id: 'guest-1',
          guest_name: '테스트 게스트',
          phone: null,
          guest_type: 'FREE',
          status: 'REGISTERED',
          created_by: 'deleted-user-1',
          created_by_profile: {
            display_name: '홍길동',
            username: 'hong',
            deleted_at: '2026-07-01T00:00:00Z', // 삭제된 스태프
          },
          business_date: businessDate,
          checked_in_at: null,
        },
      ],
      error: null,
    }

    const builder = createBuilder(fetchResult)
    const select = vi.fn(() => builder)
    supabaseMocks.mockFrom.mockImplementation(() => ({
      select,
    }))

    render(<GuestsPage user={buildUser()} />)

    await waitFor(() => {
      expect(screen.getByText(/홍길동 \(삭제된 스태프\)/)).toBeInTheDocument()
    })
  })
})
