import { useLanguage } from '../context/LanguageContext';
import { Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
    const { language, setLanguage, t } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleLanguage = () => {
        setLanguage(language === 'ko' ? 'en' : 'ko');
    };

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">CG</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">Club Guestlist</span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <button
                            onClick={() => scrollToSection('features')}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t.nav.features}
                        </button>
                        <button
                            onClick={() => scrollToSection('pricing')}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t.nav.pricing}
                        </button>
                        <button
                            onClick={() => scrollToSection('faq')}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t.nav.faq}
                        </button>
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors text-sm"
                            aria-label="Toggle language"
                        >
                            <Globe className="w-4 h-4" />
                            <span className="font-medium">{language === 'ko' ? 'KO' : 'EN'}</span>
                        </button>

                        {/* Login Button - Desktop */}
                        <a
                            href="/"
                            className="hidden md:inline-flex text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t.nav.login}
                        </a>

                        {/* CTA Button - Desktop */}
                        <a
                            href="/"
                            className="hidden md:inline-flex px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                        >
                            {t.nav.startFree}
                        </a>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border">
                        <nav className="flex flex-col gap-2">
                            <button
                                onClick={() => scrollToSection('features')}
                                className="px-4 py-2 text-left text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                            >
                                {t.nav.features}
                            </button>
                            <button
                                onClick={() => scrollToSection('pricing')}
                                className="px-4 py-2 text-left text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                            >
                                {t.nav.pricing}
                            </button>
                            <button
                                onClick={() => scrollToSection('faq')}
                                className="px-4 py-2 text-left text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                            >
                                {t.nav.faq}
                            </button>
                            <div className="flex gap-2 px-4 pt-2">
                                <a
                                    href="/"
                                    className="flex-1 text-center px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
                                >
                                    {t.nav.login}
                                </a>
                                <a
                                    href="/"
                                    className="flex-1 text-center px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                                >
                                    {t.nav.startFree}
                                </a>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
