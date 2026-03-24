import Hero from "@/components/hero";
import Profile from "@/components/profile";
import Values from "@/components/values";
import Pledges from "@/components/pledges";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <Hero />
      <Profile />
      <Values />
      <Pledges />
      <Contact />
      <Footer />
    </>
  );
}
