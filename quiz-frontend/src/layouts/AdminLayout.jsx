import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/Admin/AdminHeader.jsx";
import AdminSidebar from "../components/Admin/AdminSidebar.jsx";
import "../styles/admin.css"; 

export default function AdminLayout() {
  return (
    <div className="admin-page">
      <div className="admin-frame">
        <AdminHeader />
        <div className="admin-main">
          <AdminSidebar />
          <main className="content-frame">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
