import React from "react";

export default function LoginError({ message }) {
  if (!message) return null;
  return <p className="mt-4 text-center text-red-600 font-medium">{message}</p>;
}
