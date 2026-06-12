import React, { useState, useCallback, useRef } from "react";

// Small pure util kept outside component so it's stable across renders
const formatTime = (date) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

// Custom hook encapsulating the "current time on demand" behavior
function useCurrentTime() {
  const [time, setTime] = useState("— — : — — : — —"); // lazy placeholder

  const update = useCallback(() => {
    // Functional form not needed but shows best practice if future depends on prev
    setTime(() => formatTime(new Date()));
  }, []);

  return { time, update };
}

function App() {
  const { time, update } = useCurrentTime();
  const btnRef = useRef(null);

  // Prefer explicit handler (stable via useCallback inside hook) over inline for clarity
  const handleClick = () => {
    update();
    // Provide subtle UX: return focus to button for quick repeated presses (accessibility)
    btnRef.current?.focus();
  };

  return (
    <main className="container" role="main" aria-label="Time display app">
      <h1 aria-live="polite" aria-atomic="true">
        {time}
      </h1>
      <button ref={btnRef} type="button" onClick={handleClick} aria-label="Get the current time">
        Get Time
      </button>
    </main>
  );
}

export default App;
