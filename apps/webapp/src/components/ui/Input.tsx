import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Input({ className, label, ...props }: InputProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className={["input", className].filter(Boolean).join(" ")} {...props} />
    </label>
  );
}

export function Textarea({ className, label, ...props }: TextareaProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea className={["input", "textarea", className].filter(Boolean).join(" ")} {...props} />
    </label>
  );
}
