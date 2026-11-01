import { Suspense } from "react";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth";
import AdminDashboard from "./AdminDashboard";

async function AuthenticatedAdminDashboard() {
  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-6 py-12">
          <p className="mx-auto max-w-7xl text-gray-600">
            Loading admin dashboard...
          </p>
        </main>
      }
    >
      <AuthenticatedAdminDashboard />
    </Suspense>
  );
}