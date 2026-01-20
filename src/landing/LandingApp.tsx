import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Pricing } from './components/Pricing';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';

function LandingApp() {
    return (
        <LanguageProvider>
            <div className="min-h-screen bg-background text-foreground">
                <Header />
                <main>
                    <Hero />
                    <Features />
                    <HowItWorks />
                    <Pricing />
                    <Testimonials />
                    <FAQ />
                    <CTASection />
                </main>
                <Footer />
            </div>
        </LanguageProvider>
    );
}

export default LandingApp;
