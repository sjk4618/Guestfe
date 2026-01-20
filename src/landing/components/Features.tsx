import { useLanguage } from '../context/LanguageContext';
import {
    ClipboardList,
    CheckCircle2,
    Users,
    BarChart3,
    Building2,
    Smartphone
} from 'lucide-react';

const featureIcons = [
    ClipboardList,
    CheckCircle2,
    Users,
    BarChart3,
    Building2,
    Smartphone,
];

export function Features() {
    const { t } = useLanguage();

    return (
        <section id="features" className="py-24 bg-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        {t.features.title}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t.features.subtitle}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {t.features.items.map((feature, index) => {
                        const Icon = featureIcons[index] || ClipboardList;
                        return (
                            <div
                                key={index}
                                className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <Icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
