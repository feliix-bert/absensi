import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingSteps } from '@/components/landing/LandingSteps';
import { LandingCta } from '@/components/landing/LandingCta';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col font-sans bg-[#FAFBFC] scroll-smooth">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingSteps />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
