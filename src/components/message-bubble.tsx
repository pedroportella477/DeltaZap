"use client";

import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Message as MessageType, users } from "@/lib/data";
import { format } from "date-fns";
import { Check, CheckCheck, Heart, Smile, ThumbsUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import Image from 'next/image';

interface MessageBubbleProps {
  message: MessageType & { sender: ReturnType<typeof users.find> };
}

const isImageURL = (url: string) => {
    return url.startsWith('https://placehold.co');
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [reactions, setReactions] = useState(message.reactions || {});
  const isYou = message.senderId === "user1";

  const handleReaction = (emoji: string) => {
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

  const isMedia = isImageURL(message.content);

  return (
    <div
      className={cn("flex items-end gap-2", {
        "justify-end": isYou,
        "justify-start": !isYou,
      })}
    >
      {!isYou && (
        <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender?.avatar} />
            <AvatarFallback>{message.sender?.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}

      <div className="group relative">
        <Popover>
          <PopoverTrigger asChild>
            <div
              className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-3 py-2 shadow-md", {
                "bg-primary text-primary-foreground": isYou,
                "bg-card": !isYou,
              })}
            >
              {!isYou && message.sender && !isMedia && (
                <p className="text-xs font-semibold text-primary mb-1">{message.sender.name}</p>
              )}
              
              {isMedia ? (
                <Image 
                  src={message.content}
                  alt="sent media"
                  width={200}
                  height={200}
                  className="rounded-md"
                />
              ) : (
                <p className="text-sm break-words">{message.content}</p>
              )}

              <div className="flex items-center justify-end gap-2 mt-1">
                <p className="text-xs opacity-70">
                  {format(new Date(message.timestamp), "HH:mm")}
                </p>
                {isYou &&
                  (message.read ? (
                    <CheckCheck className="h-4 w-4 text-accent" />
                  ) : (
                    <Check className="h-4 w-4" />
                  ))}
              </div>
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
