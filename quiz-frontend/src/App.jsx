import React, { Suspense } from "react";
import MainRoutes from "./routes/mainRoutes";

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainRoutes />
    </Suspense>
  );
}
