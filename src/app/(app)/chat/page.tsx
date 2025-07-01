import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chats, users } from "@/lib/data";
import { format, isToday, isYesterday } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

export default function ChatPage() {
  const getChatListItem = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return null;

    const lastMessage = chat.messages[chat.messages.length - 1];
    const otherUser =
      chat.type === "individual"
        ? users.find((u) => u.id === chat.participants.find((p) => p.id !== "user1"))
        : null;

    const unreadCount = chat.messages.filter(m => m.senderId !== 'user1' && !m.read).length;

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        if (isToday(date)) {
            return format(date, 'HH:mm');
        }
        if (isYesterday(date)) {
            return 'Yesterday';
        }
        return format(date, 'dd/MM/yyyy');
    }

    return {
      id: chat.id,
      name: chat.name || otherUser?.name || "Unknown",
      avatar: chat.avatar || otherUser?.avatar || "",
      lastMessage: lastMessage?.content || "No messages yet",
      timestamp: lastMessage ? formatTimestamp(lastMessage.timestamp) : "",
      isRead: lastMessage?.senderId === 'user1' ? lastMessage.read : true,
      isSentByYou: lastMessage?.senderId === 'user1',
      unreadCount,
    };
  };

  const chatListItems = chats.map((chat) => getChatListItem(chat.id)).filter(Boolean);

  return (
    <div className="h-full flex flex-col">
       <CardHeader className="p-4 border-b">
         <CardTitle className="font-headline text-2xl">Chats</CardTitle>
       </CardHeader>
      <CardContent className="p-0 flex-grow overflow-y-auto">
        <div className="flex flex-col">
          {chatListItems.map((item) => (
            <Link href={`/chat/${item!.id}`} key={item!.id}>
              <div className="flex items-center p-4 hover:bg-muted/50 cursor-pointer border-b">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={item!.avatar} alt={item!.name} />
                  <AvatarFallback>{item!.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="font-semibold">{item!.name}</h3>
                  <p className="text-sm text-muted-foreground truncate flex items-center">
                    {item!.isSentByYou && (
                        item!.isRead ? <CheckCheck className="h-4 w-4 mr-1 text-accent" /> : <Check className="h-4 w-4 mr-1" />
                    )}
                    {item!.lastMessage}
                  </p>
                </div>
                <div className="flex flex-col items-end text-xs text-muted-foreground">
                  <span>{item!.timestamp}</span>
                  {item!.unreadCount > 0 && (
                     <span className="mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{item!.unreadCount}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </div>
  );
}
