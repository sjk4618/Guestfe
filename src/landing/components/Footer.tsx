import { useLanguage } from '../context/LanguageContext';

export function Footer() {
    const { t } = useLanguage();

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <footer className="py-16 bg-card border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-sm">CG</span>
                            </div>
                            <span className="text-xl font-bold text-foreground">Club Guestlist</span>
                        </div>
                        <p className="text-muted-foreground max-w-sm">
                            {t.footer.description}
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">{t.footer.product}</h4>
                        <ul className="space-y-3">
                            <li>
                                <button
                                    onClick={() => scrollToSection('features')}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t.nav.features}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => scrollToSection('pricing')}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t.nav.pricing}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => scrollToSection('faq')}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t.nav.faq}
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">{t.footer.legal}</h4>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="/terms"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t.footer.terms}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/privacy"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t.footer.privacy}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:contact@clubguestlist.com"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t.footer.contact}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-8 border-t border-border">
                    <p className="text-center text-muted-foreground text-sm">
                        {t.footer.copyright}
                    </p>
                </div>
            </div>
        </footer>
    );
}
