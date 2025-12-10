import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import MissionSection from '@/components/MissionSection';
import WaysToGiveSection from '@/components/WaysToGiveSection';
import DonationSection from '@/components/DonationSection';

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <MissionSection />
      <WaysToGiveSection />
      <DonationSection />
    </main>
  );
};

export default Index;
