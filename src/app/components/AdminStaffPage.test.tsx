import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AdminStaffPage } from './AdminStaffPage'

const supabaseMocks = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetSession: vi.fn(),
  mockInvoke: vi.fn(),
}))

const toastMocks = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: supabaseMocks.mockFrom,
    auth: {
      getSession: supabaseMocks.mockGetSession,
    },
    functions: {
      invoke: supabaseMocks.mockInvoke,
    },
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: toastMocks.toastError,
    success: toastMocks.toastSuccess,
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

describe('AdminStaffPage', () => {
  afterEach(() => {
    cleanup()
    supabaseMocks.mockFrom.mockReset()
    supabaseMocks.mockGetSession.mockReset()
    supabaseMocks.mockInvoke.mockReset()
    toastMocks.toastError.mockReset()
    toastMocks.toastSuccess.mockReset()
  })

  it('계정 생성 시 create-user 함수 호출한다', async () => {
    const fetchResult = { data: [], error: null }
    const builder = createBuilder(fetchResult)
    const select = vi.fn(() => builder)

    supabaseMocks.mockFrom.mockImplementation(() => ({
      select,
    }))
    supabaseMocks.mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'token' } },
      error: null,
    })
    supabaseMocks.mockInvoke.mockResolvedValue({ data: {}, error: null })

    render(<AdminStaffPage user={buildUser()} />)

    fireEvent.click(screen.getByRole('button', { name: '계정 생성' }))
    fireEvent.change(screen.getByLabelText('아이디 *'), {
      target: { value: 'staff1' },
    })
    fireEvent.change(screen.getByLabelText('임시 비밀번호 *'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText('이름 *'), {
      target: { value: '스태프' },
    })
    fireEvent.change(screen.getByLabelText('하루 등록 가능 인원'), {
      target: { value: '5' },
    })

    fireEvent.click(screen.getByRole('button', { name: '생성' }))

    await waitFor(() => {
      expect(supabaseMocks.mockInvoke).toHaveBeenCalledWith(
        'create-user',
        expect.objectContaining({
          body: expect.objectContaining({
            username: 'staff1',
            displayName: '스태프',
            clubId: 'club-1',
            dailyGuestLimit: 5,
          }),
        }),
      )
    })
  })

  it('하루 등록 가능 인원이 음수면 생성 요청을 막는다', async () => {
    const fetchResult = { data: [], error: null }
    const builder = createBuilder(fetchResult)
    const select = vi.fn(() => builder)

    supabaseMocks.mockFrom.mockImplementation(() => ({
      select,
    }))
    supabaseMocks.mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'token' } },
      error: null,
    })

    render(<AdminStaffPage user={buildUser()} />)

    fireEvent.click(screen.getByRole('button', { name: '계정 생성' }))
    fireEvent.change(screen.getByLabelText('아이디 *'), {
      target: { value: 'staff1' },
    })
    fireEvent.change(screen.getByLabelText('임시 비밀번호 *'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText('이름 *'), {
      target: { value: '스태프' },
    })
    fireEvent.change(screen.getByLabelText('하루 등록 가능 인원'), {
      target: { value: '-1' },
    })

    fireEvent.click(screen.getByRole('button', { name: '생성' }))

    await waitFor(() => {
      expect(toastMocks.toastError).toHaveBeenCalledWith(
        '하루 등록 가능 인원은 0 이상의 정수로 입력해주세요',
      )
    })
    expect(supabaseMocks.mockInvoke).not.toHaveBeenCalled()
  })

  it('상태 토글 시 profiles 업데이트를 호출한다', async () => {
    const fetchResult = {
      data: [
        {
          user_id: 'user-1',
          username: 'staffer',
          display_name: '스태프',
          role: 'STAFF',
          is_active: true,
          created_at: '2025-01-01',
          user_access_scopes: [],
        },
      ],
      error: null,
    }

    const builder = createBuilder(fetchResult)
    const select = vi.fn(() => builder)
    const updateBuilder: any = {
      eq: vi.fn(() => updateBuilder),
      then: (resolve: (value: unknown) => void, reject: (reason?: any) => void) =>
        Promise.resolve({ data: null, error: null }).then(resolve, reject),
    }
    const update = vi.fn(() => updateBuilder)

    supabaseMocks.mockFrom.mockImplementation(() => ({
      select,
      update,
    }))

    render(<AdminStaffPage user={buildUser()} />)

    const switches = await screen.findAllByRole('switch')
    fireEvent.click(switches[0])

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith({ is_active: false })
    })
    expect(updateBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1')
  })
})
