import InteractiveHero from "@/components/interactive-hero";
import Profile from "@/components/profile";
import Pledges from "@/components/pledges";
import HomeActionCards from "@/components/home-action-cards";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <InteractiveHero />
      <Profile />
      <Pledges />
      <HomeActionCards />
      <Contact />
      <Footer />
    </>
  );
}
