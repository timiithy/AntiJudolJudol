import Navbar from "@/components/allPage/Navbar";
import Dashboard from "@/components/MainPage/Dashboard/Dashboard";
import Hero from "@/components/MainPage/Hero";

export default async function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Dashboard />
    </main>
  );
}