import React, { useState, useCallback, useRef } from "react";
import Input from "./Input";

// Lightweight form state + validation hook
function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }, []);

  const onBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
  }, []);

  const validate = useCallback((vals) => {
    const errors = {};
    if (!vals.username) errors.username = "Username required";
    if (!vals.password) errors.password = "Password required";
    if (vals.password && vals.password.length < 6) errors.password = "Password too short";
    return errors;
  }, []);

  const errors = validate(values);
  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = async (onValid) => {
    setSubmitError(null);
    setTouched({ username: true, password: true });
    if (!isValid) return;
    try {
      setSubmitting(true);
      await onValid(values);
    } catch (err) {
      setSubmitError(err?.message || "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, touched, isValid, submitting, submitError, onChange, onBlur, handleSubmit };
}

export default function Login({ onLogin }) {
  const { values, errors, touched, submitting, submitError, onChange, onBlur, handleSubmit } = useForm({
    username: "",
    password: "",
  });
  const userRef = useRef(null);

  const submit = useCallback(
    (e) => {
      e.preventDefault();
      handleSubmit(async (vals) => {
        // Simulate async login
        await new Promise((res) => setTimeout(res, 600));
        // Provide login success upward
        onLogin?.({ user: { name: vals.username } });
      });
    },
    [handleSubmit, onLogin]
  );

  return (
    <form onSubmit={submit} className="form" style={{ maxWidth: 340, margin: "0 auto" }} noValidate>
      <h2 style={{ textAlign: "center" }}>Login</h2>
      <Input
        ref={userRef}
        autoFocus
        name="username"
        label="Username"
        placeholder="Enter username"
        value={values.username}
        onChange={onChange}
        onBlur={onBlur}
        error={touched.username && errors.username}
        required
        autoComplete="username"
      />
      <Input
        name="password"
        type="password"
        label="Password"
        placeholder="Enter password"
        value={values.password}
        onChange={onChange}
        onBlur={onBlur}
        error={touched.password && errors.password}
        required
        autoComplete="current-password"
      />
      <button
        type="submit"
        disabled={submitting}
        style={{
          width: "100%",
          padding: "0.65rem 0.75rem",
          background: submitting ? "#888" : "#0069d9",
          color: "#fff",
          fontWeight: 600,
          border: "none",
          borderRadius: 4,
          cursor: submitting ? "not-allowed" : "pointer",
          transition: "background 0.2s",
        }}
      >
        {submitting ? "Logging in..." : "Login"}
      </button>
      {submitError && (
        <p style={{ color: "crimson", marginTop: 8, fontSize: 12 }}>{submitError}</p>
      )}
    </form>
  );
}
