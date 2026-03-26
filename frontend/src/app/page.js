import Navbar from "@/components/allPage/Navbar";
import Dashboard from "@/components/MainPage/Dashboard/Dashboard";
import Hero from "@/components/MainPage/Hero";

export const dynamic = 'force-dynamic'

async function getData() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return null;
    
    const res = await fetch(apiUrl);
    if (!res.ok) return null;
    
    return res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const data = await getData();

  return (
    <main>
      <Navbar />
      <Hero />
      <Dashboard />
    </main>
  );
}