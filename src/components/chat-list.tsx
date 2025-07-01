
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle, Search, User } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { CreateGroupDialog } from "./create-group-dialog";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { useXmpp } from "@/context/xmpp-context";
import { Skeleton } from "./ui/skeleton";

export function ChatList() {
  const { roster, status } = useXmpp();
  const [isCreateGroupOpen, setCreateGroupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleGroupCreated = () => {
    // In a real app, this would trigger a roster refresh
    setCreateGroupOpen(false);
  };
  
  const filteredRoster = roster.filter(contact =>
    contact.subscription === 'both' &&
    (contact.name || contact.jid).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const isLoading = status === 'connecting' || status === 'restoring';

  return (
    <div className="h-full flex flex-col">
       <CardHeader className="p-4 border-b">
         <div className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-2xl">Contatos</CardTitle>
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
                placeholder="Pesquisar contatos..." 
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
        ) : filteredRoster.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <User className="h-12 w-12 mb-4" />
            <p className="font-semibold">Nenhum contato encontrado</p>
            <p className="text-sm">Adicione contatos no seu cliente XMPP.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredRoster.map((contact) => (
              <Link href={`/chat/${encodeURIComponent(contact.jid)}`} key={contact.jid}>
                <div className="flex items-center p-4 hover:bg-muted/50 cursor-pointer border-b">
                  <div className="relative mr-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`https://placehold.co/100x100.png`} alt={contact.name || contact.jid} />
                      <AvatarFallback>{(contact.name || contact.jid).charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {/* Presence indicator can be added here later */}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{contact.name || contact.jid}</h3>
                    <p className="text-sm text-muted-foreground truncate flex items-center">
                      {contact.jid}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
}
