"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getChatData, Message as MessageType, users } from "@/lib/data";
import { ArrowLeft, MoreVertical, Send, Smile } from "lucide-react";
import MessageBubble from "@/components/message-bubble";
import SmartReplySuggestions from "@/components/smart-reply-suggestions";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";


type ChatData = NonNullable<ReturnType<typeof getChatData>>;

const gifs = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btNa0RUYa5E7iiQ/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6Zt481isNVuQI1l6/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2K5jinAlChoCLS/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l1J9R1i2a0p2m3bPO/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ohs4w0U375xOua2w8/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13zeE9qQNC52Eg/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d3mlE7uhX8KFgEmY/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0xeJpnr35ZJ8hOUo/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/oB1vU6BHe288g/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9GimADsC3kEVO/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26n6Gx9moCgs1pUuk/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6eWRlZnRrczZ5dmp0cGJvY2l6a3NqZWpnanF3dWY2NmVqYnhlZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/11sBLVxNs7v6WA/giphy.gif",
];
const stickers = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l41lH4ADK37AANM0U/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7abBUNCB4lT6dAhO/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l41lI4bYmcsbOK6ha/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKLz4GIZdY9cZ0Y/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKS54g2eck2gG52/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKWJpFZG2ASb9w4/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKUM6e3y2o2T3m8/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKV5eqA2S31wT84/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKGRWN4x2Sg1yBq/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKUYX23AGB52Yy4/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKsWde3Ge2qA2I0/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWJpY3o4a25xZ2F4a2ZqNXE4enE3ZHA3dG5zaG00ZHM1dzluM2M4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l4pTfx2qLszoacZRS/giphy.gif",
];

export default function ChatDetailPage() {
  const params = useParams();
  const chatId = params.id as string;
  
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<ChatData['messages']>([]);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = getChatData(chatId);
    setChatData(data);
    if (data) {
      setMessages(data.messages);
    }
  }, [chatId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (content?: string) => {
    const messageContent = content || newMessage;
    if (messageContent.trim() === "" || !chatData) return;

    const currentUser = users.find((u) => u.id === "user1");

    const msg: ChatData['messages'][0] = {
      id: `msg${Date.now()}`,
      chatId,
      senderId: "user1",
      sender: currentUser!,
      content: messageContent,
      timestamp: new Date().toISOString(),
      read: false,
      reactions: {},
    };

    setMessages((prevMessages) => [...prevMessages, msg]);
    
    if (!content) {
      setNewMessage("");
    } else {
      setPopoverOpen(false);
    }


    // Simulate receiving a message and show notification
    setTimeout(() => {
      const otherParticipant = chatData.participants.find(
        (p) => p.id !== "user1"
      );
      if (otherParticipant) {
        const replyMessage: ChatData["messages"][0] = {
          id: `msg${Date.now() + 1}`,
          chatId: chatData.id,
          senderId: otherParticipant.id,
          sender: otherParticipant,
          content:
            "Esta é uma resposta automática para demonstrar as notificações!",
          timestamp: new Date().toISOString(),
          read: false,
          reactions: {},
        };

        setMessages((prev) => [...prev, replyMessage]);

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

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center p-3 border-b bg-card">
        <Link href="/chat" className="md:hidden mr-2">
           <Button variant="ghost" size="icon">
             <ArrowLeft />
           </Button>
        </Link>
        <Avatar className="h-10 w-10">
          <AvatarImage src={chatData.avatar} alt={chatData.name} />
          <AvatarFallback>{chatData.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h2 className="font-semibold font-headline">{chatData.name}</h2>
          <p className="text-xs text-muted-foreground">
            {chatData.type === 'group' ? `${chatData.participants.length} membros` : 'online'}
          </p>
        </div>
        <div className="ml-auto">
          <Button variant="ghost" size="icon">
            <MoreVertical />
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-grow" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} chatType={chatData.type} />
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
                <PopoverContent className="w-full sm:w-96 p-0 border-none">
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
                                            onClick={() => handleSendMessage(gif)}
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
                                            onClick={() => handleSendMessage(sticker)}
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
          <Input
            placeholder="Digite uma mensagem"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-grow"
          />
          <Button size="icon" className="bg-primary hover:bg-primary/90" onClick={() => handleSendMessage()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
