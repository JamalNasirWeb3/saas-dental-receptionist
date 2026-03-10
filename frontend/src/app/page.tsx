import SiteHeader from "@/components/website/SiteHeader";
import HeroSection from "@/components/website/HeroSection";
import ServicesSection from "@/components/website/ServicesSection";
import WhyUsSection from "@/components/website/WhyUsSection";
import TestimonialsSection from "@/components/website/TestimonialsSection";
import ContactSection from "@/components/website/ContactSection";
import SiteFooter from "@/components/website/SiteFooter";
import ChatWidget from "@/components/chat/ChatWidget";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ServicesSection />
        <WhyUsSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
