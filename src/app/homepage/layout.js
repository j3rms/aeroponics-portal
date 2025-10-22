import Sidebar from "@/components/sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      {children}
    </div>
  );
}
