import CryptoTable from "./app/components/CryptoTable";

export const revalidate = 0;

async function getData() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&per_page=100&page=1",
    { next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export default async function Page() {
  const initialData = await getData();

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">📊 Crypto Market Dashboard</h1>
      <CryptoTable initialData={initialData} />
    </main>
  );
}