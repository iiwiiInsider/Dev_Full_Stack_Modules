import React, { useReducer, useState } from "react";

// A small reducer to manage form field state succinctly.
function fieldsReducer(state, { name, value }) {
  return { ...state, [name]: value };
}

function Form({ isRegistered, onSubmit }) {
  const [fields, updateField] = useReducer(fieldsReducer, {
    username: "",
    password: "",
    confirm: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField({ name, value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isRegistered && fields.password !== fields.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!fields.username || !fields.password) {
      setError("All required fields must be filled.");
      return;
    }

    try {
      setSubmitting(true);
      // Simulate latency
      await new Promise((r) => setTimeout(r, 600));
      onSubmit?.({ username: fields.username, password: fields.password });
    } finally {
      setSubmitting(false);
    }
  };

  const buttonLabel = submitting
    ? (isRegistered ? "Logging in..." : "Registering...")
    : (isRegistered ? "Login" : "Register");

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <input
        name="username"
        type="text"
        placeholder="Username"
        autoComplete="username"
        value={fields.username}
        onChange={handleChange}
        aria-label="Username"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete={isRegistered ? "current-password" : "new-password"}
        value={fields.password}
        onChange={handleChange}
        aria-label="Password"
        required
      />
      {!isRegistered && (
        <input
          name="confirm"
          type="password"
            placeholder="Confirm Password"
          autoComplete="new-password"
          value={fields.confirm}
          onChange={handleChange}
          aria-label="Confirm Password"
          required={!isRegistered}
        />
      )}
      {error && (
        <p style={{ color: "#ffcdd2", marginBottom: 10 }} role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={submitting} aria-busy={submitting}>
        {buttonLabel}
      </button>
    </form>
  );
}

export default Form;
