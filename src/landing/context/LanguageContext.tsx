import { createContext, useContext, useState, ReactNode } from 'react';
import { Language, Translations, translations } from '../i18n/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguage] = useState<Language>(() => {
        // 브라우저 언어 감지
        if (typeof window !== 'undefined') {
            const browserLang = navigator.language.toLowerCase();
            if (browserLang.startsWith('ko')) return 'ko';
        }
        return 'en';
    });

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
