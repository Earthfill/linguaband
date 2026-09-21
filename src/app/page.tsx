import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StatsBar } from "@/components/StatsBar";
import { FeatureCards } from "@/components/FeatureCards";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { CoursesSection } from "@/components/CoursesSection";
import { TemplatesSection } from "@/components/TemplatesSection";
import { StepsSection } from "@/components/StepsSection";
import { AboutSection } from "@/components/AboutSection";
import { VsIeltsBanner } from "@/components/VsIeltsBanner";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <FeatureCards />
        <TestimonialCarousel />
        <CoursesSection />
        <TemplatesSection />
        <StepsSection />
        <AboutSection />
        <VsIeltsBanner />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}

