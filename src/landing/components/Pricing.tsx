import { useLanguage } from '../context/LanguageContext';
import { Check } from 'lucide-react';

export function Pricing() {
    const { t, language } = useLanguage();

    return (
        <section id="pricing" className="py-24 bg-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        {t.pricing.title}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t.pricing.subtitle}
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {t.pricing.plans.map((plan, index) => {
                        const isPopular = index === 1;
                        const isEnterprise = index === 2;

                        return (
                            <div
                                key={index}
                                className={`relative rounded-2xl p-8 ${isPopular
                                        ? 'bg-gradient-to-b from-primary/10 to-background border-2 border-primary shadow-xl shadow-primary/10'
                                        : 'bg-background border border-border'
                                    }`}
                            >
                                {/* Popular Badge */}
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                            {t.pricing.popular}
                                        </span>
                                    </div>
                                )}

                                {/* Plan Name */}
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    {plan.name}
                                </h3>
                                <p className="text-muted-foreground text-sm mb-6">
                                    {plan.description}
                                </p>

                                {/* Price */}
                                <div className="mb-6">
                                    {isEnterprise ? (
                                        <span className="text-3xl font-bold text-foreground">
                                            {plan.price}
                                        </span>
                                    ) : (
                                        <>
                                            <span className="text-sm text-muted-foreground">
                                                {language === 'ko' ? '₩' : '$'}
                                            </span>
                                            <span className="text-4xl font-bold text-foreground">
                                                {plan.price}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {t.pricing.perMonth}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <a
                                    href="/"
                                    className={`w-full inline-flex items-center justify-center py-3 px-6 rounded-xl font-medium transition-colors ${isPopular
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            : 'border border-border text-foreground hover:bg-accent'
                                        }`}
                                >
                                    {t.pricing.getStarted}
                                </a>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
