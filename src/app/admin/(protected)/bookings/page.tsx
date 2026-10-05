import { prisma } from "@/lib/prisma";
import BookingManager from "@/components/admin/BookingManager";

export const dynamic = "force-dynamic";

export default async function BookingsAdminPage() {
  const bookings = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <BookingManager initialBookings={bookings} />
    </div>
  );
}
