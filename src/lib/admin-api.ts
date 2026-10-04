import { requireAdmin } from "@/lib/auth";

export { requireAdmin };

export async function getAdminForApi() {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}
