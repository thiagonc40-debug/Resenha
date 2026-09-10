import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { BookingSection } from '../components/BookingSection';
import { HowItWorks } from '../components/HowItWorks';
import { Footer } from '../components/Footer';

export function HomePage() {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface selection:bg-primary selection:text-on-primary min-h-screen">
      <Header />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          {/* Subtle Stadium Ambient Glow Background */}
          <div className="relative w-full overflow-hidden">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-48 -right-20 w-[400px] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-md">
              <Hero />
              <div id="reservas" className="scroll-mt-24">
                <BookingSection />
              </div>
              <div id="como-funciona" className="scroll-mt-24">
                <HowItWorks />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
