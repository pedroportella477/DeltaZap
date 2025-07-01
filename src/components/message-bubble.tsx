
"use client";

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Message as MessageType, addReaction } from "@/lib/data";
import { format } from "date-fns";
import { Check, CheckCheck, Heart, Smile, ThumbsUp, FileText, Download, Reply, Forward } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import Image from 'next/image';

interface MessageBubbleProps {
  message: MessageType & { sender: { id: string, name: string, avatar: string } };
  chatType: 'group' | 'individual';
  onReply: (message: MessageType) => void;
  onForward: (message: MessageType) => void;
  searchQuery?: string;
}

const highlightText = (text: string, highlight: string) => {
    if (!highlight?.trim()) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-primary/30 rounded">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

export default function MessageBubble({ message, chatType, onReply, onForward, searchQuery }: MessageBubbleProps) {
  const [reactions, setReactions] = useState(message.reactions || {});
  const [isMounted, setIsMounted] = useState(false);
  const isYou = message.senderId === "user1";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleReaction = (emoji: string) => {
    addReaction(message.chatId, message.id, emoji);
    setReactions(prev => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }))
  }

  const reactionEmojis = {
    "❤️": <Heart className="h-4 w-4 text-red-500 fill-current" />,
    "👍": <ThumbsUp className="h-4 w-4 text-blue-500 fill-current" />,
    "😄": <Smile className="h-4 w-4 text-yellow-500 fill-current" />,
  }

  const isMedia = message.type === 'image';
  const isDocument = message.type === 'document';
  
  const RepliedMessage = () => {
      if (!message.replyTo) return null;
      return (
          <div className="p-2 text-sm rounded-md bg-black/5 dark:bg-white/5 mb-2 border-l-2 border-primary">
              <p className="font-semibold text-primary text-xs">{message.replyTo.senderName}</p>
              <p className="text-muted-foreground truncate">{message.replyTo.content}</p>
          </div>
      )
  }
  
  const ForwardedIndicator = () => {
    if (!message.forwarded) return null;
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        <Forward className="h-3 w-3" />
        <span>Mensagem encaminhada</span>
      </div>
    );
  };

  return (
    <div
      className={cn("flex items-end gap-2", {
        "justify-end": isYou,
        "justify-start": !isYou,
      })}
    >
      {!isYou && chatType === 'group' && (
        <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender?.avatar} />
            <AvatarFallback>{message.sender?.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}

      <div className="group relative">
        <Popover>
          <PopoverTrigger asChild>
            <div
              className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg shadow-md", {
                "bg-secondary text-secondary-foreground": isYou && message.type === 'text',
                "bg-card": !isYou && message.type === 'text',
                "p-0 bg-transparent": isMedia,
                "px-3 py-2": message.type === 'text',
                "p-2": isDocument,
                "bg-secondary": isYou && isDocument,
                "bg-card": !isYou && isDocument,
              })}
            >
              {!isYou && chatType === 'group' && message.sender && (
                <p className="text-xs font-semibold text-primary mb-1">{message.sender.name}</p>
              )}
              
              <ForwardedIndicator />
              <RepliedMessage />

              {isMedia ? (
                <div className="relative">
                  <Image 
                    src={message.content}
                    alt="sent media"
                    width={200}
                    height={200}
                    className="rounded-md object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-1 right-1 flex items-center justify-end gap-2">
                    <p className="text-xs text-white drop-shadow-md bg-black/20 px-1.5 py-0.5 rounded-full">
                      {isMounted ? format(new Date(message.timestamp), "HH:mm") : ''}
                    </p>
                    {isYou &&
                      (message.read ? (
                        <CheckCheck className="h-4 w-4 text-white drop-shadow-md" />
                      ) : (
                        <Check className="h-4 w-4 text-white drop-shadow-md" />
                      ))}
                  </div>
                </div>
              ) : isDocument ? (
                <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium break-words truncate">{message.fileName}</p>
                        <p className="text-xs text-muted-foreground">Documento</p>
                    </div>
                     <Button variant="ghost" size="icon" className="shrink-0" asChild>
                        <a href={message.content} download={message.fileName}>
                            <Download className="h-5 w-5" />
                        </a>
                    </Button>
                </div>
              ) : (
                <p className="text-sm break-words">
                  {highlightText(message.content, searchQuery || "")}
                </p>
              )}

              {message.type === 'text' && (
                <div className="flex items-center justify-end gap-2 mt-1">
                  <p className="text-xs opacity-70">
                    {isMounted ? format(new Date(message.timestamp), "HH:mm") : ''}
                  </p>
                  {isYou &&
                    (message.read ? (
                      <CheckCheck className="h-4 w-4 text-accent" />
                    ) : (
                      <Check className="h-4 w-4" />
                    ))}
                </div>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent side={isYou ? 'left' : 'right'} className="w-auto p-1 rounded-full">
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => handleReaction('❤️')}>
                   <Heart className="h-5 w-5 text-muted-foreground hover:text-red-500 hover:fill-current" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => handleReaction('👍')}>
                   <ThumbsUp className="h-5 w-5 text-muted-foreground hover:text-blue-500 hover:fill-current" />
                </Button>
                 <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => handleReaction('😄')}>
                   <Smile className="h-5 w-5 text-muted-foreground hover:text-yellow-500 hover:fill-current" />
                </Button>
                 <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => onReply(message)}>
                   <Reply className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
                 <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => onForward(message)}>
                   <Forward className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
            </div>
          </PopoverContent>
        </Popover>

        {Object.keys(reactions).length > 0 && (
             <div className="absolute -bottom-3 right-1 flex items-center gap-1 rounded-full bg-background border px-1.5 py-0.5 shadow-sm text-xs">
                 {Object.entries(reactions).map(([emoji, count]) => (
                    <span key={emoji} className="flex items-center gap-0.5">
                        {reactionEmojis[emoji as keyof typeof reactionEmojis]}
                        <span className="font-medium">{count > 1 ? count : ''}</span>
                    </span>
                 ))}
             </div>
        )}
      </div>
    </div>
  );
}
