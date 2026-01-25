import { AdminLayoutClient } from "@/app/admin/_components/admin-layout-client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
