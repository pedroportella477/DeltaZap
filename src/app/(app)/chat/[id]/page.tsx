import { ChatList } from "@/components/chat-list";
import { ChatDetail } from "@/components/chat-detail";
import { cn } from "@/lib/utils";

export default function ChatDetailPage({ params }: { params: { id: string } }) {
  const chatId = params.id;

  return (
    <div className="h-full flex bg-card">
      <aside className="h-full hidden md:w-80 lg:w-96 flex-col border-r md:flex">
        <ChatList />
      </aside>
      <main className="h-full flex-1 flex">
        <ChatDetail chatId={chatId} />
      </main>
    </div>
  );
}
