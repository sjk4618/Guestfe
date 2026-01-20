import { useLanguage } from '../context/LanguageContext';
import { UserPlus, UsersRound, Rocket } from 'lucide-react';

const stepIcons = [UserPlus, UsersRound, Rocket];

export function HowItWorks() {
    const { t } = useLanguage();

    return (
        <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        {t.howItWorks.title}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t.howItWorks.subtitle}
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connection Line */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {t.howItWorks.steps.map((step, index) => {
                            const Icon = stepIcons[index] || Rocket;
                            return (
                                <div key={index} className="relative text-center">
                                    {/* Step Circle */}
                                    <div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                                        <Icon className="w-8 h-8 text-primary-foreground" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-semibold text-foreground mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                                        {step.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
