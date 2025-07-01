
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getChatData, Message as MessageType, users, UserPresence } from "@/lib/data";
import { ArrowLeft, MoreVertical, Send, Smile, Paperclip, ImageIcon, FileText, Users, Circle, MinusCircle, Coffee, Utensils } from "lucide-react";
import MessageBubble from "@/components/message-bubble";
import SmartReplySuggestions from "@/components/smart-reply-suggestions";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { GroupInfoSheet } from "./group-info-sheet";

type ChatData = NonNullable<ReturnType<typeof getChatData>>;

const gifs = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btNa0RUYa5E7iiQ/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6Zt481isNVuQI1l6/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2K5jinAlChoCLS/giphy.gif",
];
const stickers = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l41lH4ADK37AANM0U/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7abBUNCB4lT6dAhO/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l41lI4bYmcsbOK6ha/giphy.gif",
];

const presenceStatus: Record<UserPresence, { icon: React.ReactNode; label: string }> = {
  online: { icon: <Circle className="h-2.5 w-2.5 text-green-500 fill-current" />, label: 'Online' },
  ocupado: { icon: <MinusCircle className="h-2.5 w-2.5 text-red-500" />, label: 'Ocupado' },
  cafe: { icon: <Coffee className="h-2.5 w-2.5 text-amber-500" />, label: 'Café' },
  almoco: { icon: <Utensils className="h-2.5 w-2.5 text-orange-500" />, label: 'Almoço' },
  offline: { icon: <Circle className="h-2.5 w-2.5 text-gray-400" />, label: 'Offline' },
};

export function ChatDetail({ chatId }: { chatId: string }) {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<ChatData['messages']>([]);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [attachmentPopoverOpen, setAttachmentPopoverOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  const refreshChatData = useCallback(() => {
    const data = getChatData(chatId);
    setChatData(data);
    if (data) {
      setMessages(data.messages);
    }
  }, [chatId]);

  useEffect(() => {
    refreshChatData();
  }, [chatId, refreshChatData]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const addMessage = (content: string, type: MessageType['type'], fileName?: string) => {
    if (content.trim() === "" || !chatData) return;

    const currentUser = users.find((u) => u.id === "user1");

    const msg: MessageType = {
      id: `msg${Date.now()}`,
      chatId,
      senderId: "user1",
      content,
      timestamp: new Date().toISOString(),
      read: false,
      reactions: {},
      type,
      fileName,
    };
    
    // This is a simulation, in a real app this would be sent to a server
    const targetChat = require('@/lib/data').chats.find((c: any) => c.id === chatId);
    if(targetChat) {
      targetChat.messages.push({ ...msg, sender: currentUser!});
    }

    refreshChatData();

    setTimeout(() => {
      const otherParticipant = chatData.participants.find(
        (p) => p.id !== "user1"
      );
      if (otherParticipant && chatData.type === 'individual') {
        const replyMessage: MessageType = {
          id: `msg${Date.now() + 1}`,
          chatId: chatData.id,
          senderId: otherParticipant.id,
          content:
            "Esta é uma resposta automática para demonstrar as notificações!",
          timestamp: new Date().toISOString(),
          read: false,
          reactions: {},
          type: 'text',
        };

        targetChat.messages.push({ ...replyMessage, sender: otherParticipant});
        refreshChatData();

        toast({
          title: `Nova mensagem de ${otherParticipant.name}`,
          description: replyMessage.content,
          action: (
            <Link href={`/chat/${chatData.id}`} passHref>
              <Button variant="outline" size="sm">
                Ver
              </Button>
            </Link>
          ),
        });
      }
    }, 2000);
  };

  const handleSendTextMessage = () => {
    if (newMessage.trim()) {
      addMessage(newMessage, 'text');
      setNewMessage("");
    }
  };
  
  const handleSendMediaMessage = (url: string) => {
    addMessage(url, 'image');
    setPopoverOpen(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === 'image' && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        addMessage(dataUrl, 'image', file.name);
      };
      reader.readAsDataURL(file);
    } else if (type === 'document') {
      addMessage('document_placeholder', 'document', file.name);
    }

    setAttachmentPopoverOpen(false);
    if (event.target) {
      event.target.value = '';
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };


  if (!chatData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Carregando conversa...</p>
      </div>
    );
  }
  
  const lastMessageFromOther = messages.slice().reverse().find(m => m.senderId !== 'user1');
  const otherParticipant = chatData.type === 'individual' ? chatData.participants.find(p => p.id !== 'user1') : null;

  const HeaderContent = () => (
    <div className="flex items-center">
      <Avatar className="h-10 w-10">
        <AvatarImage src={chatData.avatar} alt={chatData.name} />
        <AvatarFallback>{chatData.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="ml-3">
        <h2 className="font-semibold font-headline">{chatData.name}</h2>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          {chatData.type === 'group' 
            ? `${chatData.participants.length} membros` 
            : otherParticipant?.presence ? (
              <>
                {presenceStatus[otherParticipant.presence].icon}
                {presenceStatus[otherParticipant.presence].label}
              </>
            ) : 'Offline'
          }
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <Sheet open={isGroupInfoOpen} onOpenChange={setIsGroupInfoOpen}>
        <header className="flex items-center p-3 border-b bg-card">
          <Link href="/chat" className="md:hidden mr-2">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
          
          {chatData.type === 'group' ? (
            <SheetTrigger asChild className="cursor-pointer flex-grow">
              <HeaderContent />
            </SheetTrigger>
          ) : (
            <HeaderContent />
          )}

          <div className="ml-auto">
            <Button variant="ghost" size="icon">
              <MoreVertical />
            </Button>
          </div>
        </header>

        {chatData.type === 'group' && (
          <SheetContent className="w-full sm:w-[420px] p-0 flex flex-col">
              <GroupInfoSheet 
                chatId={chatData.id}
                onGroupUpdate={() => {
                  refreshChatData();
                  // A small delay to allow data to propagate before closing
                  setTimeout(() => setIsGroupInfoOpen(false), 300);
                }} 
              />
          </SheetContent>
        )}
      </Sheet>

      <ScrollArea className="flex-grow" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={{...message, sender: users.find(u => u.id === message.senderId)!}} chatType={chatData.type} />
          ))}
        </div>
      </ScrollArea>
      
      <footer className="p-4 border-t bg-card">
        <SmartReplySuggestions 
          chatHistory={messages.map(m => `${m.sender.name}: ${m.content}`).join('\n')}
          currentMessage={lastMessageFromOther?.content || ''}
          onSuggestionClick={(suggestion) => setNewMessage(suggestion)}
        />
        <div className="flex items-center space-x-2">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Smile />
                    </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" sideOffset={8} className="w-full sm:w-96 p-0 border-none">
                    <Tabs defaultValue="emoji" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="emoji">Emoji</TabsTrigger>
                            <TabsTrigger value="gif">GIFs</TabsTrigger>
                            <TabsTrigger value="sticker">Figurinhas</TabsTrigger>
                        </TabsList>
                        <TabsContent value="emoji" className="p-2">
                           <EmojiPicker
                              onEmojiClick={onEmojiClick}
                              width="100%"
                              height={350}
                              skinTonesDisabled
                              searchDisabled
                              previewConfig={{showPreview: false}}
                            />
                        </TabsContent>
                        <TabsContent value="gif" className="p-2">
                            <ScrollArea className="h-[350px]">
                                <div className="grid grid-cols-3 gap-2">
                                    {gifs.map((gif, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSendMediaMessage(gif)}
                                            className="rounded-md overflow-hidden focus:ring-2 focus:ring-ring"
                                        >
                                            <Image src={gif} width={100} height={100} alt={`gif ${index+1}`} data-ai-hint="gif funny" unoptimized />
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="sticker" className="p-2">
                            <ScrollArea className="h-[350px]">
                                <div className="grid grid-cols-3 gap-2">
                                    {stickers.map((sticker, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSendMediaMessage(sticker)}
                                            className="rounded-md overflow-hidden focus:ring-2 focus:ring-ring"
                                        >
                                            <Image src={sticker} width={100} height={100} alt={`sticker ${index+1}`} data-ai-hint="sticker cute" unoptimized/>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </PopoverContent>
            </Popover>

            <Popover open={attachmentPopoverOpen} onOpenChange={setAttachmentPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Paperclip />
                    </Button>
                </PopoverTrigger>
                <PopoverContent side="top" sideOffset={8} className="w-auto p-1">
                    <div className="flex flex-col gap-1">
                        <Button variant="ghost" className="justify-start gap-2 px-2" onClick={() => imageInputRef.current?.click()}>
                            <ImageIcon /> Imagem/Vídeo
                        </Button>
                        <Button variant="ghost" className="justify-start gap-2 px-2" onClick={() => documentInputRef.current?.click()}>
                            <FileText /> Documento
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <input
                type="file"
                ref={imageInputRef}
                onChange={(e) => handleFileChange(e, 'image')}
                className="hidden"
                accept="image/*,video/*"
            />
            <input
                type="file"
                ref={documentInputRef}
                onChange={(e) => handleFileChange(e, 'document')}
                className="hidden"
            />

          <Input
            placeholder="Digite uma mensagem"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendTextMessage()}
            className="flex-grow"
          />
          <Button size="icon" className="bg-primary hover:bg-primary/90" onClick={handleSendTextMessage}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
