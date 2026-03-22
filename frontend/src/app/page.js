import Navbar from "@/components/allPage/Navbar";

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
    </main>
  );
}