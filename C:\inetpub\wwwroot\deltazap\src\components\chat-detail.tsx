
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message as MessageType, UserPresence } from "@/lib/data";
import { ArrowLeft, MoreVertical, Send, Smile, Paperclip, ImageIcon, FileText, Search, Reply, X } from "lucide-react";
import MessageBubble from "@/components/message-bubble";
import SmartReplySuggestions from "@/components/smart-reply-suggestions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { ForwardMessageDialog } from "./forward-message-dialog";
import { useXmpp } from "@/context/xmpp-context";

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

const presenceText: Record<UserPresence, string> = {
    chat: 'Online',
    away: 'Ausente',
    dnd: 'Ocupado',
    xa: 'Ausente (Extendido)',
    unavailable: 'Offline',
};

export function ChatDetail({ chatId }: { chatId: string }) {
  const { roster, getChatById, sendMessage, markChatAsRead, userId } = useXmpp();
  const [newMessage, setNewMessage] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [attachmentPopoverOpen, setAttachmentPopoverOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyingTo, setReplyingTo] = useState<MessageType | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<MessageType | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const chatData = getChatById(chatId);
  const contactInfo = roster.find(r => r.jid === chatId);
  
  const messages = chatData?.messages || [];

  useEffect(() => {
    markChatAsRead(chatId);
    setIsSearching(false);
    setSearchQuery("");
  }, [chatId, markChatAsRead]);

  useEffect(() => {
    if (isSearching && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [isSearching]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, chatId]);


  const handleSendTextMessage = () => {
    if (newMessage.trim()) {
      sendMessage(chatId, newMessage, 'text');
      setNewMessage("");
    }
  };
  
  const handleSendMediaMessage = (url: string) => {
    sendMessage(chatId, url, 'image');
    setPopoverOpen(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        sendMessage(chatId, dataUrl, type, file.name);
    };
    reader.readAsDataURL(file);

    setAttachmentPopoverOpen(false);
    if (event.target) {
      event.target.value = '';
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };
  
  const handleReply = (message: MessageType) => {
    setReplyingTo(message);
  };
  
  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleForward = (message: MessageType) => {
    setForwardingMessage(message);
  };

  if (!chatData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Inicie uma conversa selecionando um contato.</p>
      </div>
    );
  }

  const lastMessageFromOther = messages.slice().reverse().find(m => m.senderId !== userId);
  const chatName = contactInfo?.name || chatData?.name || chatId;
  const chatAvatar = chatData?.avatar || `https://placehold.co/100x100.png`;
  
  const displayedMessages = searchQuery ? messages.filter(m => m.type === 'text' && m.content.toLowerCase().includes(searchQuery.toLowerCase())) : messages;
  const contactPresenceStatus = contactInfo?.statusText || presenceText[contactInfo?.presence || 'unavailable'];


  const HeaderContent = () => (
    <div className="flex items-center">
      <Avatar className="h-10 w-10">
        <AvatarImage src={chatAvatar} alt={chatName} />
        <AvatarFallback>{chatName?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="ml-3">
        <h2 className="font-semibold font-headline">{chatName}</h2>
        {chatData.type === 'individual' && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            {contactPresenceStatus}
          </p>
        )}
      </div>
    </div>
  );
  
  const SearchBar = () => (
    <div className="flex items-center w-full gap-2">
      <Input 
        ref={searchInputRef}
        placeholder="Pesquisar nesta conversa..."
        className="h-9"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Button variant="ghost" size="icon" onClick={() => { setIsSearching(false); setSearchQuery(""); }}>
        <X />
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center p-3 border-b bg-card">
        <Link href="/chat" className="md:hidden mr-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        
        {isSearching ? <SearchBar /> : (
          <>
            <HeaderContent />

            <div className="ml-auto flex items-center">
              <Button variant="ghost" size="icon" onClick={() => setIsSearching(true)}>
                <Search />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical />
              </Button>
            </div>
          </>
        )}
      </header>

      <ScrollArea className="flex-grow" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {displayedMessages.map((message) => {
              const senderInfo = message.sender || {
                  id: message.senderId,
                  name: roster.find(r => r.jid === message.senderId)?.name || message.senderId.split('@')[0] || message.senderId,
                  avatar: ''
              };
              return (
                  <MessageBubble 
                    key={message.id} 
                    message={{...message, sender: senderInfo}}
                    chatType={chatData?.type || 'individual'}
                    onReply={handleReply}
                    onForward={handleForward}
                    searchQuery={searchQuery}
                  />
              )
          })}
          {isSearching && displayedMessages.length === 0 && (
             <div className="text-center text-muted-foreground p-8">
                <p>Nenhuma mensagem encontrada para "{searchQuery}"</p>
             </div>
          )}
        </div>
      </ScrollArea>
      
      <footer className="p-4 border-t bg-card">
        {replyingTo && (
           <div className="p-2 mb-2 bg-muted rounded-md relative">
              <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={cancelReply}>
                  <X className="h-4 w-4" />
              </Button>
              <p className="text-sm font-semibold text-primary">Respondendo a {replyingTo.sender?.name || '...'}</p>
              <p className="text-sm text-muted-foreground truncate">{replyingTo.content}</p>
           </div>
        )}
        <SmartReplySuggestions 
          chatHistory={messages.map(m => `${m.senderId}: ${m.content}`).join('\n')}
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
      {forwardingMessage && (
        <ForwardMessageDialog 
            message={forwardingMessage}
            onClose={() => setForwardingMessage(null)}
            onForward={() => {
                // This is now handled by context
            }}
        />
      )}
    </div>
  );
}
