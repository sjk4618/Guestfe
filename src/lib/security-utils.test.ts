import { describe, it, expect, beforeEach } from 'vitest';
import {
    validateUsername,
    validatePassword,
    validatePhoneNumber,
    validateName,
    escapeHtml,
    sanitizeInput,
    hasSqlInjectionRisk,
    createRateLimiter,
    getSafeErrorMessage,
} from './security-utils';

describe('Security Utils', () => {
    describe('validateUsername', () => {
        it('유효한 사용자명 통과', () => {
            expect(validateUsername('user123').valid).toBe(true);
            expect(validateUsername('test_user').valid).toBe(true);
            expect(validateUsername('my-name').valid).toBe(true);
        });

        it('빈 사용자명 거부', () => {
            expect(validateUsername('').valid).toBe(false);
            expect(validateUsername('  ').valid).toBe(false);
        });

        it('너무 짧은 사용자명 거부', () => {
            expect(validateUsername('ab').valid).toBe(false);
        });

        it('너무 긴 사용자명 거부', () => {
            expect(validateUsername('a'.repeat(31)).valid).toBe(false);
        });

        it('특수문자 포함 사용자명 거부', () => {
            expect(validateUsername('user@name').valid).toBe(false);
            expect(validateUsername('user name').valid).toBe(false);
            expect(validateUsername('user<script>').valid).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('유효한 비밀번호 통과', () => {
            expect(validatePassword('password123').valid).toBe(true);
            expect(validatePassword('MySecure1').valid).toBe(true);
        });

        it('빈 비밀번호 거부', () => {
            expect(validatePassword('').valid).toBe(false);
        });

        it('8자 미만 비밀번호 거부', () => {
            expect(validatePassword('pass1').valid).toBe(false);
            expect(validatePassword('1234567').valid).toBe(false);
        });

        it('숫자만 있는 비밀번호는 경고와 함께 통과', () => {
            const result = validatePassword('12345678');
            expect(result.valid).toBe(true);
            expect(result.message).toBeDefined();
        });
    });

    describe('validatePhoneNumber', () => {
        it('유효한 전화번호 통과', () => {
            expect(validatePhoneNumber('01012345678').valid).toBe(true);
            expect(validatePhoneNumber('010-1234-5678').valid).toBe(true);
        });

        it('빈 전화번호 통과 (선택 사항)', () => {
            expect(validatePhoneNumber('').valid).toBe(true);
            expect(validatePhoneNumber('  ').valid).toBe(true);
        });

        it('잘못된 형식 거부', () => {
            expect(validatePhoneNumber('12345').valid).toBe(false);
            expect(validatePhoneNumber('abcdefghijk').valid).toBe(false);
        });
    });

    describe('validateName', () => {
        it('유효한 이름 통과', () => {
            expect(validateName('홍길동').valid).toBe(true);
            expect(validateName('John Doe').valid).toBe(true);
        });

        it('빈 이름 거부', () => {
            expect(validateName('').valid).toBe(false);
            expect(validateName('  ').valid).toBe(false);
        });

        it('위험한 특수문자 포함 이름 거부', () => {
            expect(validateName('user<script>').valid).toBe(false);
            expect(validateName("user'; DROP TABLE").valid).toBe(false);
        });
    });

    describe('escapeHtml', () => {
        it('HTML 특수문자 이스케이프', () => {
            expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
            expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
            expect(escapeHtml("'test'")).toBe('&#x27;test&#x27;');
        });

        it('빈 문자열 처리', () => {
            expect(escapeHtml('')).toBe('');
            // @ts-expect-error - null 테스트
            expect(escapeHtml(null)).toBe('');
        });

        it('일반 텍스트는 변경 없음', () => {
            expect(escapeHtml('Hello World')).toBe('Hello World');
            expect(escapeHtml('한글 테스트')).toBe('한글 테스트');
        });
    });

    describe('sanitizeInput', () => {
        it('앞뒤 공백 제거', () => {
            expect(sanitizeInput('  hello  ')).toBe('hello');
        });

        it('연속 공백을 하나로', () => {
            expect(sanitizeInput('hello    world')).toBe('hello world');
        });

        it('제어 문자 제거', () => {
            expect(sanitizeInput('hello\x00world')).toBe('helloworld');
        });

        it('빈 입력 처리', () => {
            expect(sanitizeInput('')).toBe('');
            // @ts-expect-error - null 테스트
            expect(sanitizeInput(null)).toBe('');
        });
    });

    describe('hasSqlInjectionRisk', () => {
        it('SQL 키워드 감지', () => {
            expect(hasSqlInjectionRisk('SELECT * FROM users')).toBe(true);
            expect(hasSqlInjectionRisk('1; DROP TABLE users')).toBe(true);
            expect(hasSqlInjectionRisk('1 OR 1=1')).toBe(true);
        });

        it('일반 텍스트는 안전', () => {
            expect(hasSqlInjectionRisk('normal text')).toBe(false);
            expect(hasSqlInjectionRisk('홍길동')).toBe(false);
        });
    });

    describe('createRateLimiter', () => {
        let limiter: ReturnType<typeof createRateLimiter>;

        beforeEach(() => {
            limiter = createRateLimiter(3, 1000); // 1초에 3회
        });

        it('제한 내 요청 허용', () => {
            expect(limiter.check('test')).toBe(true);
            expect(limiter.check('test')).toBe(true);
            expect(limiter.check('test')).toBe(true);
        });

        it('제한 초과 요청 거부', () => {
            limiter.check('test');
            limiter.check('test');
            limiter.check('test');
            expect(limiter.check('test')).toBe(false);
        });

        it('다른 키는 별도 카운트', () => {
            limiter.check('key1');
            limiter.check('key1');
            limiter.check('key1');
            expect(limiter.check('key2')).toBe(true);
        });

        it('reset 후 다시 허용', () => {
            limiter.check('test');
            limiter.check('test');
            limiter.check('test');
            limiter.reset('test');
            expect(limiter.check('test')).toBe(true);
        });
    });

    describe('getSafeErrorMessage', () => {
        it('인증 오류 메시지 일반화', () => {
            const error = new Error('Invalid login credentials');
            expect(getSafeErrorMessage(error)).toBe('아이디 또는 비밀번호가 올바르지 않습니다.');
        });

        it('네트워크 오류 메시지', () => {
            const error = new Error('Network error occurred');
            expect(getSafeErrorMessage(error)).toBe('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        });

        it('알 수 없는 오류 기본 메시지', () => {
            const error = new Error('Some internal server error with sensitive data');
            expect(getSafeErrorMessage(error)).toBe('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        });

        it('문자열 오류 처리', () => {
            expect(getSafeErrorMessage('string error')).toBe('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        });
    });
});
