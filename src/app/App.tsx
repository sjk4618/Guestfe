import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { emailFromUsername } from '../lib/auth-utils';
import { DEFAULT_CUTOFF_HOUR, DEFAULT_CUTOFF_MINUTE } from '../lib/business-date';
import { LoginPage } from './components/LoginPage';
import { MainLayout } from './components/MainLayout';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

// Mock user type -> Real user type
export type UserRole = 'ADMIN' | 'STAFF' | 'DJ' | 'PROMOTER' | 'EXTERNAL_EVENT';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  clubId: string;
  clubName: string;
  clubSlug: string;
  clubImageUrl: string | null;
  cutoffHour: number;
  cutoffMinute: number;
  dailyGuestLimit: number | null;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const PROFILE_SELECT_WITH_LOGO = `
        *,
        clubs (
          name,
          slug,
          cutoff_time,
          logo_url
        ),
        user_access_scopes (
          start_date,
          end_date
        )
      `;

      const PROFILE_SELECT = `
        *,
        clubs (
          name,
          slug,
          cutoff_time
        ),
        user_access_scopes (
          start_date,
          end_date
        )
      `;

      const loadProfile = (select: string) =>
        supabase
          .from('profiles')
          .select(select)
          .eq('user_id', userId)
          .single();

      let { data: profile, error: profileError } = await loadProfile(PROFILE_SELECT_WITH_LOGO);

      if (profileError) {
        const missingLogoColumn =
          profileError.message?.includes('logo') || profileError.details?.includes('logo');

        if (missingLogoColumn) {
          console.warn('클럽 로고 필드가 없어 기본 이미지 없이 로드합니다.');
          const fallback = await loadProfile(PROFILE_SELECT);
          profile = fallback.data;
          profileError = fallback.error;
        }
      }

      if (profileError) throw profileError;
      if (!profile) {
        throw new Error('프로필 정보를 불러올 수 없습니다.');
      }

      if (profile) {
        const accessStart = profile.user_access_scopes?.[0]?.start_date as string | undefined;
        const accessEnd = profile.user_access_scopes?.[0]?.end_date as string | undefined;
        const isWithinAccessWindow = (start?: string, end?: string) => {
          if (!start || !end) return false;
          const today = format(new Date(), 'yyyy-MM-dd');
          return today >= start && today <= end;
        };

        if (!profile.is_active) {
          toast.error('계정이 비활성화되었습니다. 관리자에게 문의하세요.');
          await supabase.auth.signOut();
          setUser(null);
          return;
        }

        if (accessStart && accessEnd && !isWithinAccessWindow(accessStart, accessEnd)) {
          toast.error('접근 기간이 아닙니다.');
          await supabase.auth.signOut();
          setUser(null);
          return;
        }

        const clubs = profile.clubs as {
          name?: string;
          slug?: string;
          cutoff_time?: string | null;
          logo_url?: string | null;
        } | null;

        const cutoffTime = clubs?.cutoff_time as string | null | undefined;
        const [cutoffHourText, cutoffMinuteText] = cutoffTime
          ? cutoffTime.split(':')
          : [];
        const cutoffHourValue = Number(cutoffHourText);
        const cutoffMinuteValue = Number(cutoffMinuteText);
        const cutoffHour = Number.isFinite(cutoffHourValue)
          ? cutoffHourValue
          : DEFAULT_CUTOFF_HOUR;
        const cutoffMinute = Number.isFinite(cutoffMinuteValue)
          ? cutoffMinuteValue
          : DEFAULT_CUTOFF_MINUTE;
        const clubImageUrl =
          typeof clubs?.logo_url === 'string' && clubs.logo_url.trim().length > 0
            ? clubs.logo_url
            : null;
        const rawDailyLimit = profile.daily_guest_limit as number | string | null | undefined;
        const parsedDailyLimit =
          typeof rawDailyLimit === 'number'
            ? rawDailyLimit
            : typeof rawDailyLimit === 'string'
              ? Number(rawDailyLimit)
              : null;
        const dailyGuestLimit =
          Number.isFinite(parsedDailyLimit) && parsedDailyLimit >= 0
            ? Math.trunc(parsedDailyLimit)
            : null;

        const nextUser: User = {
          id: profile.user_id,
          username: profile.username,
          displayName: profile.display_name || profile.username,
          role: profile.role as UserRole,
          clubId: profile.club_id,
          clubName: clubs?.name || 'Unknown Club',
          clubSlug: clubs?.slug || 'unknown',
          clubImageUrl,
          cutoffHour,
          cutoffMinute,
          dailyGuestLimit,
          isActive: profile.is_active,
          startDate: accessStart,
          endDate: accessEnd
        };
        setUser(nextUser);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('프로필 정보를 불러오는데 실패했습니다.');
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const email = emailFromUsername(username);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
        throw error;
      }

      toast.success('로그인되었습니다.');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || '로그인에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('로그아웃되었습니다.');
    } catch (error) {
      console.error('Logout error', error);
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <MainLayout user={user} onLogout={handleLogout} />
      <Toaster />
    </>
  );
}

export default App;
