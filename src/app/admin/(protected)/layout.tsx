import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await requireAdmin();

  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
