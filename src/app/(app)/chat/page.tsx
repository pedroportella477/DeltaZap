import { ChatList } from "@/components/chat-list";
import { ChatEmptyState } from "@/components/chat-empty-state";
import { cn } from "@/lib/utils";

export default function ChatLayoutPage() {
  return (
    <div className="h-full flex bg-card">
      <aside className="h-full w-full md:w-80 lg:w-96 flex-col border-r md:flex">
        <ChatList />
      </aside>
      <main className="h-full flex-1 hidden md:flex">
        <ChatEmptyState />
      </main>
    </div>
  );
}
