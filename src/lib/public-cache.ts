import { revalidateTag } from "next/cache";

export function revalidatePublicPortfolio() {
  // Next.js 16 uses a cache profile for tag invalidation.
  revalidateTag("public-portfolio", "max");
}
