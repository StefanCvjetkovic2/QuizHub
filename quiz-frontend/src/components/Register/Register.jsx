import React from "react";
import AuthLayout from "@/layouts/AuthLayout";
import RegisterForm from "./RegisterForm";

export default function Register() {
  return <AuthLayout subtitle="Kreiraj nalog i počni sa kvizovima"><RegisterForm /></AuthLayout>;
}
