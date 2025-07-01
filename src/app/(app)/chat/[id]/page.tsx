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

type ChatData = NonNullable<ReturnType<typeof getChatData>>;

const emojis = ['😀', '😂', '❤️', '👍', '🤔', '🎉', '🔥', '🙏', '😊', '😭', '🤯', '😱'];
const gifs = Array.from({ length: 12 }, () => `https://placehold.co/100x100.png`);
const stickers = Array.from({ length: 12 }, () => `https://placehold.co/100x100.png`);

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
            "This is an automated reply to demonstrate notifications!",
          timestamp: new Date().toISOString(),
          read: false,
          reactions: {},
        };

        setMessages((prev) => [...prev, replyMessage]);

        toast({
          title: `New message from ${otherParticipant.name}`,
          description: replyMessage.content,
          action: (
            <Link href={`/chat/${chatData.id}`} passHref>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
          ),
        });
      }
    }, 2000);
  };

  if (!chatData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading chat...</p>
      </div>
    );
  }
  
  const lastMessageFromOther = messages.slice().reverse().find(m => m.senderId !== 'user1');

  return (
    <div className="flex flex-col h-full bg-card">
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
            {chatData.type === 'group' ? `${chatData.participants.length} members` : 'online'}
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
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
      
      <footer className="p-4 border-t bg-background/80 backdrop-blur-sm">
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
                            <TabsTrigger value="sticker">Stickers</TabsTrigger>
                        </TabsList>
                        <TabsContent value="emoji" className="p-2">
                            <div className="grid grid-cols-8 gap-1">
                                {emojis.map((emoji) => (
                                    <Button
                                        key={emoji}
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setNewMessage((prev) => prev + emoji)}
                                        className="text-xl"
                                    >
                                        {emoji}
                                    </Button>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="gif" className="p-2">
                            <ScrollArea className="h-60">
                                <div className="grid grid-cols-3 gap-2">
                                    {gifs.map((gif, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSendMessage(gif)}
                                            className="rounded-md overflow-hidden focus:ring-2 focus:ring-ring"
                                        >
                                            <Image src={gif} width={100} height={100} alt={`gif ${index+1}`} data-ai-hint="gif funny" />
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="sticker" className="p-2">
                            <ScrollArea className="h-60">
                                <div className="grid grid-cols-3 gap-2">
                                    {stickers.map((sticker, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSendMessage(sticker)}
                                            className="rounded-md overflow-hidden focus:ring-2 focus:ring-ring"
                                        >
                                            <Image src={sticker} width={100} height={100} alt={`sticker ${index+1}`} data-ai-hint="sticker cute" />
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </PopoverContent>
            </Popover>
          <Input
            placeholder="Type a message"
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
