"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chats as initialChats, users, UserPresence } from "@/lib/data";
import { format, isToday, isYesterday } from "date-fns";
import { Check, CheckCheck, PlusCircle, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { CreateGroupDialog } from "./create-group-dialog";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isToday(date)) {
      return format(date, 'HH:mm');
  }
  if (isYesterday(date)) {
      return 'Ontem';
  }
  return format(date, 'dd/MM/yyyy');
};

const presenceIndicatorColors: Record<UserPresence, string> = {
  online: "bg-green-500",
  ocupado: "bg-red-500",
  cafe: "bg-amber-500",
  almoco: "bg-orange-500",
  offline: "bg-gray-400",
};

export function ChatList() {
  const [chats, setChats] = useState(initialChats);
  const [isCreateGroupOpen, setCreateGroupOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGroupCreated = () => {
    // Force a re-render by creating a new array reference
    setChats([...initialChats]);
    setCreateGroupOpen(false);
  };

  const getChatListItem = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return null;

    const lastMessage = chat.messages[chat.messages.length - 1];
    const otherUser =
      chat.type === "individual"
        ? users.find((u) => u.id === chat.participants.find((p) => p.userId !== "user1")?.userId)
        : null;

    const unreadCount = chat.messages.filter(m => m.senderId !== 'user1' && !m.read).length;

    return {
      id: chat.id,
      name: chat.name || otherUser?.name || "Unknown",
      avatar: chat.avatar || otherUser?.avatar || "",
      presence: chat.type === 'individual' ? otherUser?.presence : undefined,
      lastMessage: lastMessage?.content || "Nenhuma mensagem ainda",
      timestamp: lastMessage ? lastMessage.timestamp : "",
      isRead: lastMessage?.senderId === 'user1' ? lastMessage.read : true,
      isSentByYou: lastMessage?.senderId === 'user1',
      unreadCount,
    };
  };

  const chatListItems = chats.map((chat) => getChatListItem(chat.id)).filter(Boolean);

  const filteredChatListItems = chatListItems.filter(item => 
    item!.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
       <CardHeader className="p-4 border-b">
         <div className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-2xl">Conversas</CardTitle>
            <Dialog open={isCreateGroupOpen} onOpenChange={setCreateGroupOpen}>
              <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <PlusCircle className="h-6 w-6" />
                  </Button>
              </DialogTrigger>
              <CreateGroupDialog onGroupCreated={handleGroupCreated} />
            </Dialog>
         </div>
         <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Pesquisar ou começar uma nova conversa" 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
       </CardHeader>
      <CardContent className="p-0 flex-grow overflow-y-auto">
        <div className="flex flex-col">
          {filteredChatListItems.map((item) => (
            <Link href={`/chat/${item!.id}`} key={item!.id}>
              <div className="flex items-center p-4 hover:bg-muted/50 cursor-pointer border-b">
                <div className="relative mr-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={item!.avatar} alt={item!.name} />
                    <AvatarFallback>{item!.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {item?.presence && item.presence !== 'offline' && (
                    <div className={cn(
                      "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card",
                      presenceIndicatorColors[item.presence]
                    )} />
                  )}
                </div>
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
                  <span>{isMounted ? formatTimestamp(item!.timestamp) : ''}</span>
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
