import { useEffect } from 'react';
import HeroSection from '../components/organisms/HeroSection';
import SkillsSection from '../components/organisms/SkillsSection';
import PortfolioSection from '../components/organisms/PortfolioSection';
import BlogSection from '../components/organisms/BlogSection';
import ContactSection from '../components/organisms/ContactSection';

export default function HomePage() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  return (
    <>
      <HeroSection />
      <SkillsSection />
      <PortfolioSection />
      <BlogSection />
      <ContactSection />
    </>
  );
}
