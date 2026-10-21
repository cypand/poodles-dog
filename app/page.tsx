import Header from "@/components/Header";
import Hero from "@/components/Hero";
import RecentListings from "@/components/RecentListings";
import HowItWorks from "@/components/HowItWorks";
import TrustStrip from "@/components/TrustStrip";
import WhyChoose from "@/components/WhyChoose";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <RecentListings />
      <HowItWorks />
      <TrustStrip />
      <WhyChoose />
      <Newsletter />
      <Footer />
    </main>
  );
}
