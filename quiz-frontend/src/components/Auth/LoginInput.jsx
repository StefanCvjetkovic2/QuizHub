import React from "react";
export default function LoginInput({ id, label, type, value, onChange, error }) {
  return (
    <div className="mt-4 first:mt-0">
      <label htmlFor={id} className="block mb-2 font-medium text-gray-700">{label}</label>
      <input
        id={id} type={type} required value={value} onChange={onChange}
        placeholder={`Your ${label.toLowerCase()}`}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
