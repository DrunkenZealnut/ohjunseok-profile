import InteractiveHero from "@/components/interactive-hero";
import Profile from "@/components/profile";
import Story from "@/components/story";
import Pledges from "@/components/pledges";
import HomeActionCards from "@/components/home-action-cards";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <InteractiveHero />
      <Profile />
      <Story />
      <Pledges />
      <HomeActionCards />
      <Contact />
      <Footer />
    </>
  );
}
