"use client";
import Sidebar from "@/components/sidebar";
import withAuth from "@/components/withAuth";

function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      {children}
    </div>
  );
}

export default withAuth(Layout);
