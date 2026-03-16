async function getData() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL);
  return res.json();
}

export default async function Home() {
  const data = await getData();

  return (
    <main>
      <h1>Status: {data.message}</h1>
    </main>
  );
}