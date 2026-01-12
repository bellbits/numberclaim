import { useState } from "react";

export default function Home() {
  const [number, setNumber] = useState(null);
  const [error, setError] = useState(null);

  async function claim() {
    setError(null);

    const res = await fetch("/api/claim", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
    } else {
      setNumber(data.number);
    }
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Claim Your Number</h1>
      <button onClick={claim}>Claim Number</button>

      {number && <h2>Your number: {number}</h2>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}

