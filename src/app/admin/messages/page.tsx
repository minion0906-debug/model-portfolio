import { prisma } from "@/lib/prisma";
import MessageManager from "@/components/admin/MessageManager";

export const dynamic = "force-dynamic";

export default async function MessagesAdminPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <MessageManager initialMessages={messages} />;
}
