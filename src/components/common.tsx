"use client";

import { useRef } from "react";

type Props = {
  className?: string;
  children: React.ReactNode;
  bold?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

export function Card({ className = "", children }: Props) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-4 text-xl font-bold text-gray-900">{children}</h1>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-sm font-semibold text-ballet-800 flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-full bg-ballet-400" />
      {children}
    </h2>
  );
}

export function PrimaryButton({ className = "", children, bold = true, onClick, disabled, type = "button" }: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl bg-ballet-600 py-3 text-center text-white disabled:bg-gray-300 disabled:text-gray-500 ${bold ? "font-bold" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export function DangerButton({ className = "", children, onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl bg-red-100 py-2.5 text-center text-sm font-bold text-red-600 disabled:bg-gray-200 disabled:text-gray-400 ${className}`}
    >
      {children}
    </button>
  );
}

export function InputField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "number" | "datetime-local";
  required?: boolean;
  placeholder?: string;
  min?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-600">
        {label}
        {required && <span className="ml-1 text-red-500">必須</span>}
      </span>
      <input
        type={type}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base outline-none focus:border-ballet-500 focus:ring-2 focus:ring-ballet-200"
      />
    </label>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  rows = 4,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-600">
        {label}
        {required && <span className="ml-1 text-red-500">必須</span>}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base outline-none focus:border-ballet-500 focus:ring-2 focus:ring-ballet-200"
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base outline-none focus:border-ballet-500 focus:ring-2 focus:ring-ballet-200"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** 撮影/ライブラリから画像を選択（QR出席のカメラ起動に使用） */
export function CameraCapture({ onCapture }: { onCapture: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onCapture(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-xl bg-gray-800 py-3 font-bold text-white"
      >
        カメラを起動する
      </button>
    </div>
  );
}
