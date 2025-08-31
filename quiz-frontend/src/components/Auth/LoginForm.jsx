import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginInput from "./LoginInput";
import LoginError from "./LoginError";
import { loginUser } from "../../services/userService";
import { setRoles, getRolesFromToken, isAdmin } from "../../services/tokenService";


export default function LoginForm() {
  const [identifier, setIdentifier] = useState(""); // username ili email
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setFieldErrors({});
  setLoading(true);
  try {
    const data = await loginUser({ identifier, password });
    if (data?.success) {
      // 1) Snimi token
      localStorage.setItem("access_token", data.token);

      // 2) Izvuci role DIREKTNO iz tokena (odmah, bez mreže)
      const tokenRoles = getRolesFromToken();
      setRoles(tokenRoles);

      // 3) Pokušaj i /users/me (ako želiš potvrdu/refresh rola iz BE)
      try { await fetchMe(); } catch { /* ignoriši ako padne, imamo roles iz tokena */ }

      // 4) Redirect po roli
      if (isAdmin()) {
        nav("/admin", { replace: true });
      } else {
        nav("/", { replace: true });
      }
    } else {
      setFieldErrors({ general: data?.message || "Login failed." });
    }
  } catch (error) {
    const apiMsg = error?.response?.data?.message || error?.message;
    setFieldErrors({ general: apiMsg || "Unexpected error." });
  } finally {
    setLoading(false);
  }
};
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
      <Link to="/" className="block w-full text-2xl font-semibold mb-6 text-center">QuizHub</Link>

      <LoginInput
        id="identifier"
        label="Username or Email"
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        error={fieldErrors.Identifier}
      />

      <LoginInput
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.Password}
      />

      <button type="submit" disabled={loading}
        className="w-full mt-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
        {loading ? "Logging in..." : "Login"}
      </button>

      <LoginError message={fieldErrors.general} />

      <p className="mt-4 text-center text-gray-600">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
      </p>
    </form>
  );
}
