import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Play } from 'lucide-react';

export function Hero() {
    const { t } = useLanguage();

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card z-0" />

            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    {t.pricing.plans[1]?.features[0] || 'Premium Features'}
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 whitespace-pre-line leading-tight">
                    {t.hero.title}
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 whitespace-pre-line">
                    {t.hero.subtitle}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                        href="/"
                        className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                    >
                        {t.hero.cta}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <button
                        className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-border text-foreground font-semibold text-lg hover:bg-accent transition-all"
                    >
                        <Play className="w-5 h-5" />
                        {t.hero.demo}
                    </button>
                </div>

                {/* Stats */}
                <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                    <div>
                        <div className="text-3xl sm:text-4xl font-bold text-primary">500+</div>
                        <div className="text-sm text-muted-foreground mt-1">Active Clubs</div>
                    </div>
                    <div>
                        <div className="text-3xl sm:text-4xl font-bold text-primary">1M+</div>
                        <div className="text-sm text-muted-foreground mt-1">Guests Managed</div>
                    </div>
                    <div>
                        <div className="text-3xl sm:text-4xl font-bold text-primary">99.9%</div>
                        <div className="text-sm text-muted-foreground mt-1">Uptime</div>
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div className="mt-20 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
                    <div className="relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl">
                        <div className="aspect-[16/9] max-h-[500px] bg-gradient-to-br from-card to-muted flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                    <span className="text-3xl font-bold text-primary-foreground">CG</span>
                                </div>
                                <p className="text-muted-foreground">Dashboard Preview</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
