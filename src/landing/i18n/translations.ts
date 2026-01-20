// 다국어 번역 데이터
export type Language = 'ko' | 'en';

export interface Translations {
    // Header
    nav: {
        features: string;
        pricing: string;
        faq: string;
        login: string;
        startFree: string;
    };
    // Hero
    hero: {
        title: string;
        subtitle: string;
        cta: string;
        demo: string;
    };
    // Features
    features: {
        title: string;
        subtitle: string;
        items: {
            title: string;
            description: string;
        }[];
    };
    // How It Works
    howItWorks: {
        title: string;
        subtitle: string;
        steps: {
            title: string;
            description: string;
        }[];
    };
    // Pricing
    pricing: {
        title: string;
        subtitle: string;
        monthly: string;
        perMonth: string;
        contact: string;
        popular: string;
        getStarted: string;
        plans: {
            name: string;
            price: string;
            description: string;
            features: string[];
        }[];
    };
    // Testimonials
    testimonials: {
        title: string;
        subtitle: string;
        items: {
            quote: string;
            name: string;
            role: string;
            club: string;
        }[];
    };
    // FAQ
    faq: {
        title: string;
        subtitle: string;
        items: {
            question: string;
            answer: string;
        }[];
    };
    // CTA
    cta: {
        title: string;
        subtitle: string;
        button: string;
    };
    // Footer
    footer: {
        description: string;
        product: string;
        company: string;
        legal: string;
        terms: string;
        privacy: string;
        contact: string;
        copyright: string;
    };
}

export const translations: Record<Language, Translations> = {
    ko: {
        nav: {
            features: '기능',
            pricing: '요금제',
            faq: 'FAQ',
            login: '로그인',
            startFree: '무료 시작',
        },
        hero: {
            title: '클럽 게스트 관리,\n이제 스마트하게',
            subtitle: '게스트 리스트부터 도어 체크인, 실시간 통계까지.\n클럽 운영의 모든 것을 한 곳에서 관리하세요.',
            cta: '무료로 시작하기',
            demo: '데모 보기',
        },
        features: {
            title: '강력한 기능',
            subtitle: '클럽 운영에 필요한 모든 것',
            items: [
                {
                    title: '스마트 게스트 리스트',
                    description: '무료/유료 게스트를 손쉽게 등록하고 관리하세요. 실시간으로 리스트를 공유하고 업데이트할 수 있습니다.',
                },
                {
                    title: '원터치 도어 체크인',
                    description: '빠른 검색과 터치 한 번으로 체크인을 완료하세요. 도어에서 지연 없이 손님을 맞이할 수 있습니다.',
                },
                {
                    title: '역할 기반 권한 관리',
                    description: 'ADMIN, STAFF, DJ, 프로모터 등 역할별로 세분화된 접근 권한을 설정하세요.',
                },
                {
                    title: '실시간 통계 대시보드',
                    description: '일간/주간/월간 통계를 한눈에 파악하세요. 데이터 기반 의사결정으로 매출을 극대화하세요.',
                },
                {
                    title: '멀티 클럽 지원',
                    description: '여러 클럽을 운영하시나요? 각 클럽의 데이터를 완전히 분리하여 독립적으로 관리합니다.',
                },
                {
                    title: '모바일 최적화',
                    description: '스마트폰, 태블릿 어디서든 완벽하게 작동합니다. 도어에서도, 사무실에서도 편리하게 사용하세요.',
                },
            ],
        },
        howItWorks: {
            title: '간단한 시작',
            subtitle: '3단계로 시작하는 스마트 클럽 관리',
            steps: [
                {
                    title: '1. 계정 생성',
                    description: '이메일로 간편하게 계정을 만들고 클럽 정보를 입력하세요.',
                },
                {
                    title: '2. 스태프 초대',
                    description: '팀원들을 초대하고 역할별 권한을 설정하세요.',
                },
                {
                    title: '3. 바로 사용',
                    description: '게스트를 등록하고 도어에서 체크인을 시작하세요!',
                },
            ],
        },
        pricing: {
            title: '합리적인 요금제',
            subtitle: '클럽 규모에 맞는 플랜을 선택하세요',
            monthly: '월',
            perMonth: '/월',
            contact: '문의',
            popular: '인기',
            getStarted: '시작하기',
            plans: [
                {
                    name: 'Basic',
                    price: '99,000',
                    description: '소규모 클럽에 적합',
                    features: [
                        '월 게스트 500명',
                        '스태프 계정 3개',
                        '기본 통계',
                        '이메일 지원',
                    ],
                },
                {
                    name: 'Pro',
                    price: '199,000',
                    description: '성장하는 클럽을 위한 선택',
                    features: [
                        '무제한 게스트',
                        '스태프 계정 10개',
                        '고급 통계 및 리포트',
                        '우선 지원',
                        'CSV 내보내기',
                    ],
                },
                {
                    name: 'Enterprise',
                    price: '문의',
                    description: '대형 클럽 및 체인점',
                    features: [
                        '무제한 게스트',
                        '무제한 스태프',
                        '멀티 클럽 관리',
                        '전담 매니저',
                        'API 접근',
                        '맞춤 개발',
                    ],
                },
            ],
        },
        testimonials: {
            title: '고객 후기',
            subtitle: '클럽 운영자들이 직접 전하는 이야기',
            items: [
                {
                    quote: '도어에서 게스트 찾는 시간이 절반으로 줄었어요. 대기줄이 빨리 빠져서 손님들 만족도가 확실히 올랐습니다.',
                    name: '김민수',
                    role: '대표',
                    club: 'Club Octagon',
                },
                {
                    quote: '프로모터들 각각 게스트 성과를 실시간으로 볼 수 있어서 관리가 훨씬 수월해졌어요.',
                    name: '이지현',
                    role: '운영팀장',
                    club: 'Arena Seoul',
                },
                {
                    quote: '3개 지점 데이터를 한눈에 볼 수 있어서 의사결정이 빨라졌습니다. Enterprise 플랜 강추합니다.',
                    name: '박준혁',
                    role: 'CEO',
                    club: 'Club Mass',
                },
            ],
        },
        faq: {
            title: '자주 묻는 질문',
            subtitle: '궁금한 점이 있으신가요?',
            items: [
                {
                    question: '무료 체험 기간이 있나요?',
                    answer: '네, 14일 동안 Pro 플랜의 모든 기능을 무료로 체험하실 수 있습니다. 카드 등록 없이 시작하세요.',
                },
                {
                    question: '계약 기간은 어떻게 되나요?',
                    answer: '월간 결제로 언제든지 해지 가능합니다. 연간 결제 시 2개월 할인 혜택을 드립니다.',
                },
                {
                    question: '데이터 보안은 어떻게 관리되나요?',
                    answer: '모든 데이터는 암호화되어 안전하게 저장됩니다. 역할별 접근 권한으로 정보를 보호합니다.',
                },
                {
                    question: '기존 데이터를 가져올 수 있나요?',
                    answer: 'Excel 또는 CSV 파일로 기존 게스트 리스트를 간편하게 가져올 수 있습니다.',
                },
                {
                    question: '여러 클럽을 운영 중인데 통합 관리가 가능한가요?',
                    answer: 'Enterprise 플랜에서 멀티 클럽 관리를 지원합니다. 각 클럽 데이터는 완전히 분리되어 안전하게 관리됩니다.',
                },
            ],
        },
        cta: {
            title: '지금 시작하세요',
            subtitle: '14일 무료 체험으로 클럽 운영의 혁신을 경험하세요',
            button: '무료 체험 시작',
        },
        footer: {
            description: '클럽 게스트 관리의 새로운 기준',
            product: '제품',
            company: '회사',
            legal: '법적 고지',
            terms: '이용약관',
            privacy: '개인정보처리방침',
            contact: '문의하기',
            copyright: '© 2026 Club Guestlist. All rights reserved.',
        },
    },
    en: {
        nav: {
            features: 'Features',
            pricing: 'Pricing',
            faq: 'FAQ',
            login: 'Login',
            startFree: 'Start Free',
        },
        hero: {
            title: 'Smart Club\nGuest Management',
            subtitle: 'From guest lists to door check-in and real-time analytics.\nManage everything in one place.',
            cta: 'Start for Free',
            demo: 'Watch Demo',
        },
        features: {
            title: 'Powerful Features',
            subtitle: 'Everything you need for club operations',
            items: [
                {
                    title: 'Smart Guest Lists',
                    description: 'Easily register and manage complimentary and paying guests. Share and update lists in real-time.',
                },
                {
                    title: 'One-Touch Check-in',
                    description: 'Complete check-ins with quick search and a single tap. Welcome guests without delays at the door.',
                },
                {
                    title: 'Role-Based Access Control',
                    description: 'Set granular permissions for ADMIN, STAFF, DJ, Promoters, and more.',
                },
                {
                    title: 'Real-Time Dashboard',
                    description: 'View daily, weekly, and monthly statistics at a glance. Maximize revenue with data-driven decisions.',
                },
                {
                    title: 'Multi-Club Support',
                    description: 'Running multiple venues? Manage each club independently with completely separated data.',
                },
                {
                    title: 'Mobile Optimized',
                    description: 'Works perfectly on smartphones and tablets. Use it at the door or in the office.',
                },
            ],
        },
        howItWorks: {
            title: 'Easy to Start',
            subtitle: 'Get started in 3 simple steps',
            steps: [
                {
                    title: '1. Create Account',
                    description: 'Sign up with your email and enter your club information.',
                },
                {
                    title: '2. Invite Team',
                    description: 'Invite your team members and assign role-based permissions.',
                },
                {
                    title: '3. Start Using',
                    description: 'Register guests and start checking them in at the door!',
                },
            ],
        },
        pricing: {
            title: 'Simple Pricing',
            subtitle: 'Choose the plan that fits your club',
            monthly: 'mo',
            perMonth: '/mo',
            contact: 'Contact',
            popular: 'Popular',
            getStarted: 'Get Started',
            plans: [
                {
                    name: 'Basic',
                    price: '99',
                    description: 'Perfect for small clubs',
                    features: [
                        '500 guests/month',
                        '3 staff accounts',
                        'Basic analytics',
                        'Email support',
                    ],
                },
                {
                    name: 'Pro',
                    price: '199',
                    description: 'For growing venues',
                    features: [
                        'Unlimited guests',
                        '10 staff accounts',
                        'Advanced analytics & reports',
                        'Priority support',
                        'CSV export',
                    ],
                },
                {
                    name: 'Enterprise',
                    price: 'Contact',
                    description: 'For large clubs & chains',
                    features: [
                        'Unlimited guests',
                        'Unlimited staff',
                        'Multi-club management',
                        'Dedicated manager',
                        'API access',
                        'Custom development',
                    ],
                },
            ],
        },
        testimonials: {
            title: 'Testimonials',
            subtitle: 'What club owners are saying',
            items: [
                {
                    quote: 'Finding guests at the door now takes half the time. The queue moves faster and our guests are happier.',
                    name: 'Minsu Kim',
                    role: 'Owner',
                    club: 'Club Octagon',
                },
                {
                    quote: 'Being able to see each promoter\'s performance in real-time has made management so much easier.',
                    name: 'Jihyun Lee',
                    role: 'Operations Manager',
                    club: 'Arena Seoul',
                },
                {
                    quote: 'Seeing all 3 location data at once speeds up our decision making. Highly recommend Enterprise plan.',
                    name: 'Junhyuk Park',
                    role: 'CEO',
                    club: 'Club Mass',
                },
            ],
        },
        faq: {
            title: 'FAQ',
            subtitle: 'Have questions?',
            items: [
                {
                    question: 'Is there a free trial?',
                    answer: 'Yes, you can try all Pro plan features free for 14 days. No credit card required.',
                },
                {
                    question: 'What are the contract terms?',
                    answer: 'Pay monthly and cancel anytime. Get 2 months free with annual billing.',
                },
                {
                    question: 'How is data security handled?',
                    answer: 'All data is encrypted and stored securely. Role-based permissions protect your information.',
                },
                {
                    question: 'Can I import existing data?',
                    answer: 'Yes, you can easily import your existing guest lists from Excel or CSV files.',
                },
                {
                    question: 'Can I manage multiple clubs?',
                    answer: 'The Enterprise plan supports multi-club management with completely separated data for each venue.',
                },
            ],
        },
        cta: {
            title: 'Get Started Today',
            subtitle: 'Experience the revolution in club management with a 14-day free trial',
            button: 'Start Free Trial',
        },
        footer: {
            description: 'The new standard in club guest management',
            product: 'Product',
            company: 'Company',
            legal: 'Legal',
            terms: 'Terms of Service',
            privacy: 'Privacy Policy',
            contact: 'Contact Us',
            copyright: '© 2026 Club Guestlist. All rights reserved.',
        },
    },
};
