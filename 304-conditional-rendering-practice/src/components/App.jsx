import React, { useState, useCallback } from "react";
import Form from "./Form";

// NOTE: Do not move this variable per challenge instructions.
// Toggle its value below (or change to true) to see the conditional rendering differences.
var userIsRegistered = false;

function App() {
  // Local UI state (not replacing the challenge variable) for demo extras like success message.
  const [status, setStatus] = useState({ submitted: false, mode: userIsRegistered ? "login" : "register" });

  const handleSubmit = useCallback((data) => {
    // Fake async action to demonstrate advanced pattern.
    setStatus({ submitted: true, mode: userIsRegistered ? "login" : "register" });
    // In a real app you'd call an API here.
    console.log("Form submitted", data);
  }, []);

  return (
    <div className="container">
      <h1>{userIsRegistered ? "Welcome Back" : "Create Account"}</h1>
      <Form isRegistered={userIsRegistered} onSubmit={handleSubmit} />
      {status.submitted && (
        <p style={{ marginTop: 20, fontSize: 18 }}>
          {status.mode === "login" ? "Logged in successfully." : "Registration successful (demo)."}
        </p>
      )}
    </div>
  );
}

export default App;
