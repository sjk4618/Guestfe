import { describe, expect, it } from 'vitest';
import { getBusinessDateFor } from './business-date';

describe('getBusinessDateFor', () => {
  it('컷오프 이전 시간은 전날 영업일로 계산한다', () => {
    const date = new Date(2025, 0, 3, 5, 59);
    const result = getBusinessDateFor(date, 6, 0);

    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(2);
    expect(result.getHours()).toBe(0);
  });

  it('컷오프 이후 시간은 당일 영업일로 계산한다', () => {
    const date = new Date(2025, 0, 3, 6, 0);
    const result = getBusinessDateFor(date, 6, 0);

    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(3);
    expect(result.getHours()).toBe(0);
  });
});
