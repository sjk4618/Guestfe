/**
 * 스태프 프로필 정보를 기반으로 표시 이름을 반환합니다.
 * 삭제된 스태프인 경우 "이름 (삭제된 스태프)" 형식으로 표시합니다.
 */
export interface StaffProfile {
  display_name?: string | null;
  username?: string | null;
  deleted_at?: string | null;
}

/**
 * 스태프 이름을 포맷합니다.
 * @param profile - 스태프 프로필 (profiles 테이블에서 조인된 데이터)
 * @param fallback - profile이 null일 때 반환할 기본값
 * @returns 포맷된 스태프 이름
 */
export const formatStaffName = (
  profile: StaffProfile | null | undefined,
  fallback = ''
): string => {
  if (!profile) return fallback;

  const name = profile.display_name || profile.username || fallback;
  if (!name) return fallback;

  if (profile.deleted_at) {
    return `${name} (삭제된 스태프)`;
  }

  return name;
};
