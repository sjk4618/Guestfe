import { describe, expect, it } from 'vitest';
import { formatStaffName } from './staff-utils';

describe('formatStaffName', () => {
  it('정상 스태프는 display_name을 반환한다', () => {
    expect(formatStaffName({ display_name: '홍길동', username: 'hong', deleted_at: null })).toBe('홍길동');
  });

  it('display_name이 없으면 username을 반환한다', () => {
    expect(formatStaffName({ display_name: null, username: 'hong', deleted_at: null })).toBe('hong');
  });

  it('deleted_at이 있으면 "(삭제된 스태프)" 접미사를 붙인다', () => {
    expect(
      formatStaffName({ display_name: '홍길동', username: 'hong', deleted_at: '2026-07-01T00:00:00Z' })
    ).toBe('홍길동 (삭제된 스태프)');
  });

  it('deleted_at이 있고 display_name이 없으면 username에 접미사를 붙인다', () => {
    expect(
      formatStaffName({ display_name: null, username: 'hong', deleted_at: '2026-07-01T00:00:00Z' })
    ).toBe('hong (삭제된 스태프)');
  });

  it('profile이 null이면 fallback을 반환한다', () => {
    expect(formatStaffName(null, '알 수 없음')).toBe('알 수 없음');
  });

  it('profile이 null이고 fallback도 없으면 빈 문자열을 반환한다', () => {
    expect(formatStaffName(null)).toBe('');
  });

  it('display_name과 username이 모두 null/undefined이면 fallback을 반환한다', () => {
    expect(formatStaffName({ display_name: null, username: null, deleted_at: null }, '기본값')).toBe('기본값');
  });
});
