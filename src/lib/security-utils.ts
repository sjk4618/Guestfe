/**
 * Security Utilities
 * 보안 관련 유틸리티 함수들
 * 
 * - 입력 검증
 * - XSS 방어를 위한 sanitize
 * - Rate limiting (클라이언트 측)
 */

// ============================================================================
// Input Validation
// ============================================================================

/**
 * 사용자명 유효성 검사
 * - 3~30자
 * - 영문, 숫자, 밑줄(_), 하이픈(-) 만 허용
 */
export function validateUsername(username: string): { valid: boolean; message?: string } {
    if (!username || typeof username !== 'string') {
        return { valid: false, message: '사용자명을 입력해주세요.' };
    }

    const trimmed = username.trim();

    if (trimmed.length < 3) {
        return { valid: false, message: '사용자명은 최소 3자 이상이어야 합니다.' };
    }

    if (trimmed.length > 30) {
        return { valid: false, message: '사용자명은 최대 30자까지 가능합니다.' };
    }

    // 영문, 숫자, 밑줄, 하이픈만 허용
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmed)) {
        return { valid: false, message: '사용자명은 영문, 숫자, 밑줄(_), 하이픈(-)만 사용 가능합니다.' };
    }

    return { valid: true };
}

/**
 * 비밀번호 유효성 검사
 * - 최소 8자
 * - 영문과 숫자 포함 권장
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: '비밀번호를 입력해주세요.' };
    }

    if (password.length < 8) {
        return { valid: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' };
    }

    if (password.length > 128) {
        return { valid: false, message: '비밀번호가 너무 깁니다.' };
    }

    // 영문과 숫자 포함 검사 (경고만, 통과는 시킴)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLetter || !hasNumber) {
        return {
            valid: true,
            message: '보안을 위해 영문과 숫자를 모두 포함하는 것을 권장합니다.'
        };
    }

    return { valid: true };
}

/**
 * 전화번호 유효성 검사
 * - 한국 전화번호 형식 (010-1234-5678 또는 01012345678)
 */
export function validatePhoneNumber(phone: string): { valid: boolean; message?: string } {
    if (!phone || typeof phone !== 'string') {
        return { valid: true }; // 전화번호는 선택 사항
    }

    const trimmed = phone.trim();
    if (trimmed === '') {
        return { valid: true };
    }

    // 숫자와 하이픈만 추출
    const digitsOnly = trimmed.replace(/-/g, '');

    // 한국 전화번호 형식 검사 (10-11자리)
    const phoneRegex = /^0[0-9]{9,10}$/;
    if (!phoneRegex.test(digitsOnly)) {
        return { valid: false, message: '올바른 전화번호 형식이 아닙니다.' };
    }

    return { valid: true };
}

/**
 * 이름 유효성 검사
 * - 2~50자
 * - 특수문자 제한
 */
export function validateName(name: string): { valid: boolean; message?: string } {
    if (!name || typeof name !== 'string') {
        return { valid: false, message: '이름을 입력해주세요.' };
    }

    const trimmed = name.trim();

    if (trimmed.length < 1) {
        return { valid: false, message: '이름을 입력해주세요.' };
    }

    if (trimmed.length > 50) {
        return { valid: false, message: '이름은 최대 50자까지 가능합니다.' };
    }

    // 위험한 특수문자 검사 (HTML/Script injection 방지)
    const dangerousChars = /[<>'";&\\]/;
    if (dangerousChars.test(trimmed)) {
        return { valid: false, message: '이름에 허용되지 않는 문자가 포함되어 있습니다.' };
    }

    return { valid: true };
}

// ============================================================================
// XSS Prevention - Sanitization
// ============================================================================

/**
 * HTML 특수문자 이스케이프
 * XSS 공격 방지를 위해 HTML 엔티티로 변환
 */
export function escapeHtml(str: string): string {
    if (!str || typeof str !== 'string') {
        return '';
    }

    const htmlEntities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;',
    };

    return str.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * 입력값 정규화 및 sanitize
 * - 앞뒤 공백 제거
 * - 연속 공백을 하나로
 * - 제어 문자 제거
 */
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    return input
        // 제어 문자 제거 (탭, 줄바꿈 제외)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // 앞뒤 공백 제거
        .trim()
        // 연속 공백을 하나로
        .replace(/\s+/g, ' ');
}

/**
 * SQL Injection 위험 문자 검사
 * (참고용 - Supabase는 ORM 사용으로 기본 방어됨)
 */
export function hasSqlInjectionRisk(input: string): boolean {
    if (!input || typeof input !== 'string') {
        return false;
    }

    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
        /(--|;|\/\*|\*\/)/,
        /(\bOR\b\s+\d+\s*=\s*\d+)/i,
        /(\bAND\b\s+\d+\s*=\s*\d+)/i,
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
}

// ============================================================================
// Rate Limiting (Client-side)
// ============================================================================

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * 클라이언트 측 Rate Limiter 생성
 * 서버 측 Rate Limiting의 보조 역할
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
    return {
        /**
         * 요청 가능 여부 확인
         * @param key 식별자 (예: 'login', 'createGuest')
         * @returns true = 요청 가능, false = 제한됨
         */
        check(key: string): boolean {
            const now = Date.now();
            const entry = rateLimitStore.get(key);

            if (!entry || now > entry.resetTime) {
                rateLimitStore.set(key, {
                    count: 1,
                    resetTime: now + windowMs,
                });
                return true;
            }

            if (entry.count >= maxRequests) {
                return false;
            }

            entry.count++;
            return true;
        },

        /**
         * 남은 시간(초) 반환
         */
        getRemainingTime(key: string): number {
            const entry = rateLimitStore.get(key);
            if (!entry) return 0;

            const remaining = Math.max(0, entry.resetTime - Date.now());
            return Math.ceil(remaining / 1000);
        },

        /**
         * 특정 키의 제한 해제
         */
        reset(key: string): void {
            rateLimitStore.delete(key);
        },
    };
}

// 기본 Rate Limiter 인스턴스들
export const loginRateLimiter = createRateLimiter(5, 60 * 1000); // 분당 5회
export const apiRateLimiter = createRateLimiter(30, 60 * 1000);  // 분당 30회

// ============================================================================
// Error Handling
// ============================================================================

/**
 * 에러 메시지 일반화
 * 민감한 정보 노출 방지
 */
export function getSafeErrorMessage(error: unknown): string {
    // 알려진 에러 유형 처리
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // 인증 관련
        if (message.includes('invalid login credentials')) {
            return '아이디 또는 비밀번호가 올바르지 않습니다.';
        }
        if (message.includes('unauthorized') || message.includes('401')) {
            return '인증이 필요합니다. 다시 로그인해주세요.';
        }
        if (message.includes('forbidden') || message.includes('403')) {
            return '접근 권한이 없습니다.';
        }

        // 네트워크 관련
        if (message.includes('network') || message.includes('fetch')) {
            return '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
        if (message.includes('timeout')) {
            return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
        }

        // Rate limiting
        if (message.includes('rate limit') || message.includes('too many')) {
            return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
        }

        // 검증 관련
        if (message.includes('validation') || message.includes('invalid')) {
            return '입력 정보를 확인해주세요.';
        }
    }

    // 기본 메시지
    return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

/**
 * 개발 환경에서만 상세 에러 로깅
 */
export function logError(context: string, error: unknown): void {
    if (import.meta.env.DEV) {
        console.error(`[${context}]`, error);
    } else {
        // 프로덕션에서는 최소 정보만 로깅
        console.error(`[${context}] An error occurred`);
    }
}
