
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, MessageSquare } from "lucide-react";
import { Input } from "./ui/input";
import { useXmpp } from "@/context/xmpp-context";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

export function ChatList() {
  const { chats, roster, status } = useXmpp();
  const [searchTerm, setSearchTerm] = useState("");

  const isLoading = status === 'connecting' || status === 'restoring';

  const filteredChats = chats.filter(chat =>
    (chat.name || chat.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRoster = roster.filter(contact =>
    contact.subscription === 'both' &&
    (contact.name || contact.jid).toLowerCase().includes(searchTerm.toLowerCase()) &&
    !chats.some(c => c.id === contact.jid) // Only show contacts you haven't chatted with yet
  );

  return (
    <div className="h-full flex flex-col">
       <CardHeader className="p-4 border-b">
         <div className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-2xl">Conversas</CardTitle>
         </div>
         <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Pesquisar conversas ou contatos..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
       </CardHeader>
      <CardContent className="p-0 flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 && filteredRoster.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <MessageSquare className="h-12 w-12 mb-4" />
            <p className="font-semibold">Nenhuma conversa</p>
            <p className="text-sm">Comece uma nova conversa pesquisando por um contato.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredChats.map((chat) => {
                const lastMessage = chat.messages[chat.messages.length - 1];
                return (
                  <Link href={`/chat/${encodeURIComponent(chat.id)}`} key={chat.id}>
                    <div className="flex items-center p-4 hover:bg-muted/50 cursor-pointer border-b">
                      <div className="relative mr-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={chat.avatar} alt={chat.name || chat.id} />
                          <AvatarFallback>{(chat.name || chat.id).charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <h3 className="font-semibold truncate">{chat.name || chat.id}</h3>
                        <p className="text-sm text-muted-foreground truncate flex items-center">
                          {lastMessage?.content}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1 ml-2 text-xs text-muted-foreground whitespace-nowrap">
                        {lastMessage && formatDistanceToNow(new Date(lastMessage.timestamp), { locale: ptBR, addSuffix: true })}
                        {chat.unreadCount && chat.unreadCount > 0 && (
                            <Badge className="h-5 w-5 flex items-center justify-center p-0">{chat.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                )
            })}
             {filteredRoster.length > 0 && (
                <>
                 <div className="p-2 text-xs font-semibold text-muted-foreground bg-muted">CONTATOS</div>
                 {filteredRoster.map((contact) => (
                    <Link href={`/chat/${encodeURIComponent(contact.jid)}`} key={contact.jid}>
                        <div className="flex items-center p-4 hover:bg-muted/50 cursor-pointer border-b">
                            <Avatar className="h-12 w-12 mr-4">
                                <AvatarImage src={`https://placehold.co/100x100.png`} alt={contact.name || contact.jid} />
                                <AvatarFallback>{(contact.name || contact.jid).charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <h3 className="font-semibold">{contact.name || contact.jid}</h3>
                                <p className="text-sm text-muted-foreground truncate">{contact.jid}</p>
                            </div>
                        </div>
                    </Link>
                 ))}
                </>
             )}
          </div>
        )}
      </CardContent>
    </div>
  );
}
