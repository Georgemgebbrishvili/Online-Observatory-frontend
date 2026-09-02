import {
  cloneElement,
  type InputHTMLAttributes,
  type ReactElement,
  type TextareaHTMLAttributes,
} from "react";

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactElement<{
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }>;
};

export function Field({ children, error, hint, htmlFor, label }: FieldProps) {
  const message = error ?? hint;
  const messageId = message ? `${htmlFor}-message` : undefined;

  return (
    <div className="field">
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      <div>
        {cloneElement(children, {
          "aria-describedby": children.props["aria-describedby"] ?? messageId,
          "aria-invalid": children.props["aria-invalid"] ?? Boolean(error),
        })}
      </div>
      {message && (
        <p
          className={`field-message ${error ? "field-message-error" : ""}`}
          id={messageId}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input ${className}`} {...props} />;
}

export function TextArea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`textarea ${className}`} {...props} />;
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function Checkbox({ className = "", label, ...props }: CheckboxProps) {
  return (
    <label className={`checkbox ${className}`}>
      <input type="checkbox" {...props} />
      <span aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}
