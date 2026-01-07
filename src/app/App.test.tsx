import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const supabaseMocks = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockSignOut: vi.fn(),
  mockFrom: vi.fn(),
}))

const toastMocks = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: supabaseMocks.mockGetSession,
      onAuthStateChange: supabaseMocks.mockOnAuthStateChange,
      signOut: supabaseMocks.mockSignOut,
    },
    from: supabaseMocks.mockFrom,
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: toastMocks.toastError,
    success: toastMocks.toastSuccess,
  },
}))

vi.mock('./components/LoginPage', () => ({
  LoginPage: () => <div>Login</div>,
}))

vi.mock('./components/MainLayout', () => ({
  MainLayout: () => <div>Main</div>,
}))

vi.mock('./components/ui/sonner', () => ({
  Toaster: () => null,
}))

const buildProfile = (overrides: Record<string, unknown>) => ({
  user_id: 'user-1',
  username: 'tester',
  display_name: 'Tester',
  role: 'STAFF',
  club_id: 'club-1',
  is_active: true,
  clubs: { name: 'Club', slug: 'club' },
  user_access_scopes: [],
  ...overrides,
})

beforeEach(() => {
  supabaseMocks.mockGetSession.mockResolvedValue({
    data: { session: { user: { id: 'user-1' } } },
  })
  supabaseMocks.mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
})

afterEach(() => {
  vi.useRealTimers()
  supabaseMocks.mockGetSession.mockReset()
  supabaseMocks.mockOnAuthStateChange.mockReset()
  supabaseMocks.mockSignOut.mockReset()
  supabaseMocks.mockFrom.mockReset()
  toastMocks.toastError.mockReset()
  toastMocks.toastSuccess.mockReset()
})

it('비활성 계정은 로그인 차단한다', async () => {
  const mockSingle = vi.fn().mockResolvedValue({
    data: buildProfile({ is_active: false }),
    error: null,
  })
  const mockEq = vi.fn(() => ({ single: mockSingle }))
  const mockSelect = vi.fn(() => ({ eq: mockEq }))
  supabaseMocks.mockFrom.mockReturnValue({ select: mockSelect })

  render(<App />)

  await waitFor(() => {
    expect(supabaseMocks.mockSignOut).toHaveBeenCalled()
  })

  expect(toastMocks.toastError).toHaveBeenCalledWith('계정이 비활성화되었습니다. 관리자에게 문의하세요.')
})

it('프로모터는 접근 기간 외 로그인 차단한다', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-01-10T00:00:00'))

  const mockSingle = vi.fn().mockResolvedValue({
    data: buildProfile({
      role: 'PROMOTER',
      user_access_scopes: [
        { start_date: '2025-01-11', end_date: '2025-01-12' },
      ],
    }),
    error: null,
  })
  const mockEq = vi.fn(() => ({ single: mockSingle }))
  const mockSelect = vi.fn(() => ({ eq: mockEq }))
  supabaseMocks.mockFrom.mockReturnValue({ select: mockSelect })

  render(<App />)

  await vi.runAllTimersAsync()
  await Promise.resolve()

  expect(supabaseMocks.mockSignOut).toHaveBeenCalled()

  expect(toastMocks.toastError).toHaveBeenCalledWith('접근 기간이 아닙니다.')
})
