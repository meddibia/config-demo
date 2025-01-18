import React, { useState } from "react";
import type { FormField } from "../services/types";

interface FieldProps {
  field: FormField;
}

function FormFieldComponent({ field }: FieldProps) {
  const [value, setValue] = useState(field.default ?? "");

  // Switch on field.type
  switch (field.type) {
    case "header":
      return <h3>{field.content}</h3>;

    case "static":
      return <div>{field.content}</div>;

    case "text":
      return (
        <div style={{ marginBottom: "1rem" }}>
          <label>
            {field.label}
            <input
              type="text"
              name={field.name}
              value={String(value)}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
        </div>
      );

    case "select":
      return (
        <div style={{ marginBottom: "1rem" }}>
          <label>
            {field.label}
            <select
              name={field.name}
              value={String(value)}
              onChange={(e) => setValue(e.target.value)}
            >
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </div>
      );

    case "checkbox":
      return (
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <input
              type="checkbox"
              name={field.name}
              checked={Boolean(value)}
              onChange={(e) => setValue(e.target.checked)}
            />
            {field.label}
          </label>
        </div>
      );

    default:
      return <div>Unsupported field type: {field.type}</div>;
  }
}

export default FormFieldComponent;
