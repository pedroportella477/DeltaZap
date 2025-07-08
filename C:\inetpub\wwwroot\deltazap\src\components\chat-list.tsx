
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, MessageSquare, Circle, UserPlus, Check, X } from "lucide-react";
import { Input } from "./ui/input";
import { useXmpp } from "@/context/xmpp-context";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { UserPresence } from "@/lib/data";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

const presenceColor: Record<UserPresence, string> = {
    chat: 'bg-green-500',
    away: 'bg-yellow-500',
    dnd: 'bg-red-500',
    xa: 'bg-yellow-500',
    unavailable: 'bg-gray-400',
};

const addContactSchema = z.object({
  jid: z.string().refine(val => val.includes('@'), { message: "Por favor, insira um JID válido (ex: usuario@servidor.com)." })
});
type AddContactForm = z.infer<typeof addContactSchema>;

export function ChatList() {
  const { chats, roster, status, addContact, subscriptionRequests, acceptSubscription, declineSubscription } = useXmpp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddContactForm>({
    resolver: zodResolver(addContactSchema)
  });

  const onAddContactSubmit = (data: AddContactForm) => {
    addContact(data.jid);
    toast({ title: "Convite enviado!", description: `Solicitação de amizade enviada para ${data.jid}.` });
    reset();
    setIsAddContactOpen(false);
  };

  const handleAccept = (jid: string) => {
    acceptSubscription(jid);
    toast({ title: "Contato adicionado!", description: `${jid} agora está na sua lista de contatos.` });
  };
  
  const handleDecline = (jid: string) => {
    declineSubscription(jid);
    toast({ title: "Convite recusado.", variant: "destructive" });
  };

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
            <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserPlus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Contato</DialogTitle>
                  <DialogDescription>Digite o JID do contato que você deseja adicionar.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onAddContactSubmit)} className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="jid-add">JID do Contato</Label>
                    <Input id="jid-add" {...register("jid")} placeholder="usuario@servidor.com" />
                    {errors.jid && <p className="text-sm text-destructive mt-1">{errors.jid.message}</p>}
                  </div>
                  <DialogFooter>
                    <Button type="submit">Adicionar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
        ) : (
          <>
            {subscriptionRequests.length > 0 && (
              <div className="p-4">
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Solicitações Pendentes</h4>
                <div className="space-y-2">
                  {subscriptionRequests.map(jid => (
                    <div key={jid} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <p className="text-sm font-medium truncate">{jid}</p>
                      <div className="flex gap-2 shrink-0">
                        <Button size="icon" className="h-8 w-8 bg-green-500 hover:bg-green-600" onClick={() => handleAccept(jid)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDecline(jid)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4"/>
              </div>
            )}

            {filteredChats.length === 0 && filteredRoster.length === 0 && subscriptionRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <MessageSquare className="h-12 w-12 mb-4" />
                <p className="font-semibold">Nenhuma conversa</p>
                <p className="text-sm">Comece uma nova conversa adicionando um contato.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredChats.map((chat) => {
                    const lastMessage = chat.messages[chat.messages.length - 1];
                    const contact = roster.find(r => r.jid === chat.id);
                    return (
                      <Link href={`/chat/${encodeURIComponent(chat.id)}`} key={chat.id}>
                        <div className="flex items-center p-4 hover:bg-muted/50 cursor-pointer border-b">
                          <div className="relative mr-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={chat.avatar} alt={chat.name || chat.id} />
                              <AvatarFallback>{(chat.name || chat.id).charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {contact?.presence && contact.presence !== 'unavailable' && (
                               <div className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background", presenceColor[contact.presence])} />
                            )}
                          </div>
                          <div className="flex-grow overflow-hidden">
                            <h3 className="font-semibold truncate">{contact?.name || chat.name || chat.id}</h3>
                            <p className="text-sm text-muted-foreground truncate flex items-center">
                              {lastMessage?.content}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-1 ml-2 text-xs text-muted-foreground whitespace-nowrap">
                            {lastMessage?.timestamp && formatDistanceToNow(typeof lastMessage.timestamp === 'string' ? new Date(lastMessage.timestamp) : lastMessage.timestamp.toDate(), { locale: ptBR, addSuffix: true })}
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
                                <div className="relative mr-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={`https://placehold.co/100x100.png`} alt={contact.name || contact.jid} />
                                        <AvatarFallback>{(contact.name || contact.jid).charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {contact.presence && contact.presence !== 'unavailable' && (
                                        <div className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background", presenceColor[contact.presence])} />
                                    )}
                                </div>
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
          </>
        )}
      </CardContent>
    </div>
  );
}
