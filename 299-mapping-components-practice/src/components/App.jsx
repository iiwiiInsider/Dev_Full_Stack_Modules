import React, { useMemo, useState } from "react";
import data from "../emojipedia";
import Card from "./Card";

function App() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.meaning.toLowerCase().includes(q) ||
        e.emoji.includes(q)
    );
  }, [query]);

  return (
    <div>
      <h1>
        <span>emojipedia</span>
      </h1>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <input
          placeholder="Search emoji, name, or meaning..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: 8,
            border: "2px solid #00ff91ff",
            fontSize: "1rem",
            outline: "none",
            boxSizing: "border-box"
          }}
        />
        <p style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
          Showing {filtered.length} of {data.length} emojis
        </p>
      </div>
      <dl className="dictionary" style={{ marginTop: "2rem" }}>
        {filtered.map((item) => (
          <Card key={item.id} emoji={item.emoji} name={item.name} meaning={item.meaning} />
        ))}
      </dl>
    </div>
  );
}

export default App;
