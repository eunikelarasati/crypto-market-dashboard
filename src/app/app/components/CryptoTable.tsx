"use client";

import { useEffect, useState } from "react";

type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
};

export default function CryptoTable({ initialData }: { initialData: Coin[] }) {
  const [data, setData] = useState<Coin[]>(initialData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  // Realtime Refresh (10 detik sekali)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&per_page=100&page=1"
        );
        const newData: Coin[] = await res.json();

        if (JSON.stringify(newData) !== JSON.stringify(data)) {
          setData(newData);
        }
      } catch (err) {
        console.error("Refresh error:", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [data]);

  // 🔍 Search dengan API Coingecko
  useEffect(() => {
    if (!search) {
      setData(initialData);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${search}`
        );
        const result = await res.json();

        if (result.coins.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }

        const ids = result.coins.map((c: any) => c.id).join(",");

        const res2 = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&ids=${ids}`
        );
        const detailed: Coin[] = await res2.json();

        setData(detailed);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search, initialData]);

  // 📄 Pagination
  const start = (page - 1) * itemsPerPage;
  const paginated = data.slice(start, start + itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search Token"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        className="w-full p-2 mb-4 border rounded-lg"
      />

      {loading && <p className="text-gray-500 mb-2">Loading...</p>}

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Logo</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Symbol</th>
            <th className="p-2 text-right">Price (IDR)</th>
            <th className="p-2 text-right">24h %</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length > 0 ? (
            paginated.map((coin) => (
              <tr key={coin.id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                </td>
                <td className="p-2">{coin.name}</td>
                <td className="p-2 uppercase">{coin.symbol}</td>
                <td className="p-2 text-right">
                  {coin.current_price.toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })}
                </td>
                <td
                  className={`p-2 text-right ${
                    coin.price_change_percentage_24h > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
