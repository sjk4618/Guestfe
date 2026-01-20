import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FAQ() {
    const { t } = useLanguage();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-24 bg-card">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        {t.faq.title}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {t.faq.subtitle}
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {t.faq.items.map((item, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-border bg-background overflow-hidden"
                        >
                            <button
                                onClick={() => toggleItem(index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-accent/50 transition-colors"
                            >
                                <span className="font-medium text-foreground pr-4">
                                    {item.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-200 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                    }`}
                            >
                                <div className="p-6 pt-0 text-muted-foreground leading-relaxed">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
