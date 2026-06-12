import React, { forwardRef, useRef, useEffect } from "react";

// Simple unique id generator persisted across renders
let globalId = 0;
function useUniqueId(prefix = "id") {
  const idRef = useRef(null);
  if (idRef.current === null) {
    globalId += 1;
    idRef.current = `${prefix}-${globalId}`;
  }
  return idRef.current;
}

// Advanced reusable input component with:
// - forwardRef exposure
// - optional label auto-association
// - supports validation feedback
// - minimal re-render via React.memo (parent can also memoize)
const Input = forwardRef(function Input(
  { label, type = "text", name, value, onChange, onBlur, placeholder, autoComplete, error, required, ...rest },
  ref
) {
  const internalId = useUniqueId(name || type);
  const describedById = error ? `${internalId}-error` : undefined;

  // Autofocus first input if requested
  useEffect(() => {
    if (rest.autoFocus && ref && typeof ref !== "function" && ref?.current) {
      ref.current.focus();
    }
  }, [ref, rest.autoFocus]);

  return (
    <div className="field" style={{ marginBottom: "0.75rem" }}>
      {label && (
        <label htmlFor={internalId} style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
          {label} {required && <span style={{ color: "crimson" }}>*</span>}
        </label>
      )}
      <input
        id={internalId}
        ref={ref}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={describedById}
        required={required}
        {...rest}
        style={{
          padding: "0.5rem 0.65rem",
          width: "100%",
            border: `1px solid ${error ? 'crimson' : '#ccc'}`,
          borderRadius: 4,
          outline: 'none'
        }}
      />
      {error && (
        <div id={describedById} role="alert" style={{ color: "crimson", fontSize: 12, marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
});

export default React.memo(Input);
