import React, { useState, useCallback } from "react";
import Login from "./Login";

// Demonstrates conditional rendering using advanced patterns (lazy state init, memoized callbacks)
export default function App() {
  const [session, setSession] = useState(() => null); // lazy initializer

  const handleLogin = useCallback((result) => {
    setSession(result);
  }, []);

  const logout = useCallback(() => setSession(null), []);

  return (
    <div className="container" style={{ padding: "2rem" }}>
      {!session ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div style={{ textAlign: "center" }}>
          <h1 style={{ marginBottom: "1rem" }}>Welcome, {session.user.name}!</h1>
          <button
            onClick={logout}
            style={{
              padding: "0.6rem 1.1rem",
              background: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
