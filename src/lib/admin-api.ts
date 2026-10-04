import { requireAdmin } from "@/lib/auth";

export async function getAdminForApi() {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}
