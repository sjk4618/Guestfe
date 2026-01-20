import { useLanguage } from '../context/LanguageContext';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
    const { t } = useLanguage();

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                    {t.cta.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                    {t.cta.subtitle}
                </p>
                <a
                    href="/"
                    className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                >
                    {t.cta.button}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </section>
    );
}
