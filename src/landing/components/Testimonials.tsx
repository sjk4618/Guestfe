import { useLanguage } from '../context/LanguageContext';
import { Quote } from 'lucide-react';

export function Testimonials() {
    const { t } = useLanguage();

    return (
        <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        {t.testimonials.title}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t.testimonials.subtitle}
                    </p>
                </div>

                {/* Testimonial Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {t.testimonials.items.map((testimonial, index) => (
                        <div
                            key={index}
                            className="relative p-8 rounded-2xl bg-card border border-border"
                        >
                            {/* Quote Icon */}
                            <Quote className="w-10 h-10 text-primary/20 mb-4" />

                            {/* Quote Text */}
                            <p className="text-foreground leading-relaxed mb-6">
                                "{testimonial.quote}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                    <span className="text-primary-foreground font-semibold">
                                        {testimonial.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <div className="font-semibold text-foreground">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {testimonial.role} · {testimonial.club}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
