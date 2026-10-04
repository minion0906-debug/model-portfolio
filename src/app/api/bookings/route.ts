import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bookingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  bookingType: z.string().trim().max(120).optional().or(z.literal("")),
  preferredDate: z.string().optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  budget: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(4000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
    }

    const settings = await prisma.siteSettings.findFirst({
      select: { acceptingBookings: true },
    });

    if (settings && !settings.acceptingBookings) {
      return NextResponse.json(
        { error: "Booking requests are currently closed." },
        { status: 403 },
      );
    }

    const data = parsed.data;
    let preferredDate: Date | null = null;

    if (data.preferredDate) {
      const parsedDate = new Date(`${data.preferredDate}T12:00:00`);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: "Please enter a valid preferred date." }, { status: 400 });
      }
      preferredDate = parsedDate;
    }

    await prisma.bookingRequest.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        company: data.company || null,
        bookingType: data.bookingType || null,
        preferredDate,
        location: data.location || null,
        budget: data.budget || null,
        message: data.message,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Booking submission error:", error);
    return NextResponse.json({ error: "Unable to submit your request right now." }, { status: 500 });
  }
}
