import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { format } from 'date-fns'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DoorPage } from './DoorPage'
import { getBusinessDateFor } from '@/lib/business-date'

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

describe('DoorPage', () => {
  afterEach(() => {
    supabaseMocks.mockFrom.mockReset()
    toastMocks.toastError.mockReset()
    toastMocks.toastSuccess.mockReset()
  })

  it('입장 완료 처리 시 Supabase update를 호출한다', async () => {
    const businessDate = format(getBusinessDateFor(new Date(), 0, 0), 'yyyy-MM-dd')
    const fetchResult = {
      data: [
        {
          id: 'guest-1',
          guest_name: '김민수',
          phone: '010-1234-5678',
          guest_type: 'FREE',
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

    const updateResult = {
      data: {
        id: 'guest-1',
        guest_name: '김민수',
        phone: '010-1234-5678',
        guest_type: 'FREE',
        status: 'CHECKED_IN',
        created_by: 'user-1',
        created_by_profile: {
          display_name: '스태프',
          username: 'staffer',
        },
        business_date: businessDate,
        checked_in_by: 'user-1',
        checked_in_by_profile: {
          display_name: '스태프',
          username: 'staffer',
        },
        checked_in_at: new Date().toISOString(),
      },
      error: null,
    }

    const selectSingle = vi.fn().mockResolvedValue(updateResult)
    const selectAfterUpdate = vi.fn(() => ({ single: selectSingle }))
    const update = vi.fn(() => {
      const updateBuilder: any = {
        eq: vi.fn(() => updateBuilder),
        select: selectAfterUpdate,
      }
      return updateBuilder
    })

    const builder = createBuilder(fetchResult)
    const select = vi.fn(() => builder)

    supabaseMocks.mockFrom.mockImplementation(() => ({
      select,
      update,
    }))

    render(<DoorPage user={buildUser()} />)

    await waitFor(() => {
      expect(select).toHaveBeenCalledWith(expect.stringContaining('created_by_profile'))
    })

    fireEvent.click(screen.getByRole('button', { name: '입장' }))
    fireEvent.click(screen.getByRole('button', { name: '확인' }))

    await waitFor(() => {
      expect(update).toHaveBeenCalled()
    })

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'CHECKED_IN',
        checked_in_by: 'user-1',
      }),
    )
    expect(toastMocks.toastSuccess).toHaveBeenCalledWith('김민수님 입장 처리 완료')
  })

  it('입장 완료된 게스트는 연한 회색 배경과 흰색 텍스트로 표시한다', async () => {
    const businessDate = format(getBusinessDateFor(new Date(), 0, 0), 'yyyy-MM-dd')
    const fetchResult = {
      data: [
        {
          id: 'guest-1',
          guest_name: '김민수',
          phone: '010-1234-5678',
          guest_type: 'FREE',
          status: 'CHECKED_IN',
          created_by: 'user-1',
          created_by_profile: {
            display_name: '스태프',
            username: 'staffer',
          },
          business_date: businessDate,
          checked_in_by: 'user-1',
          checked_in_by_profile: {
            display_name: '스태프',
            username: 'staffer',
          },
          checked_in_at: new Date().toISOString(),
        },
      ],
      error: null,
    }

    const builder = createBuilder(fetchResult)
    const select = vi.fn(() => builder)

    supabaseMocks.mockFrom.mockImplementation(() => ({
      select,
      update: vi.fn(),
    }))

    render(<DoorPage user={buildUser()} />)

    await waitFor(() => {
      expect(select).toHaveBeenCalled()
    })

    const nameNodes = screen.getAllByText('김민수')
    const card = nameNodes
      .map((node) => node.closest('[data-slot="card"]'))
      .find(Boolean)
    if (!card) {
      throw new Error('게스트 카드가 없습니다.')
    }
    expect(card).toHaveClass('bg-gray-700')

    const createdBy = within(card).getByText('등록한 사람: 스태프')
    expect(createdBy).toHaveClass('text-white')

    const checkedInAt = within(card).getByText(/^입장시간:/)
    expect(checkedInAt).toHaveClass('text-white')

    const checkedInBy = within(card).getByText('처리: 스태프')
    expect(checkedInBy).toHaveClass('text-white')
  })
})
