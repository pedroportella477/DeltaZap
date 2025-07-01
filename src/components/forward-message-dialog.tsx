
"use client";

import { useState } from 'react';
import { chats, forwardMessage, Message as MessageType, users } from '@/lib/data';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ForwardMessageDialogProps {
    message: MessageType | null;
    onClose: () => void;
    onForward: () => void;
}

export function ForwardMessageDialog({ message, onClose, onForward }: ForwardMessageDialogProps) {
    const [selectedChats, setSelectedChats] = useState<string[]>([]);
    const { toast } = useToast();

    if (!message) {
        return null;
    }

    const handleForward = () => {
        if (selectedChats.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Nenhuma conversa selecionada',
                description: 'Por favor, selecione pelo menos uma conversa para encaminhar.',
            });
            return;
        }

        forwardMessage(message, selectedChats);
        toast({
            title: 'Mensagem encaminhada!',
            description: `Sua mensagem foi encaminhada para ${selectedChats.length} conversa(s).`,
        });
        onForward();
        onClose();
    };

    const getChatDetails = (chat: typeof chats[0]) => {
        if (chat.type === 'group') {
            return { name: chat.name, avatar: chat.avatar };
        }
        const otherParticipantId = chat.participants.find(p => p.userId !== 'user1')?.userId;
        const otherUser = users.find(u => u.id === otherParticipantId);
        return { name: otherUser?.name, avatar: otherUser?.avatar };
    }

    return (
        <Dialog open={!!message} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Encaminhar mensagem para...</DialogTitle>
                    <DialogDescription>Selecione uma ou mais conversas.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-64 my-4">
                    <div className="space-y-1">
                        {chats.map(chat => {
                            const details = getChatDetails(chat);
                            return (
                                <Label 
                                    key={chat.id}
                                    htmlFor={`chat-${chat.id}`}
                                    className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted/50 cursor-pointer"
                                >
                                     <Checkbox
                                        id={`chat-${chat.id}`}
                                        checked={selectedChats.includes(chat.id)}
                                        onCheckedChange={(checked) => {
                                            setSelectedChats(prev => 
                                                checked
                                                    ? [...prev, chat.id]
                                                    : prev.filter(id => id !== chat.id)
                                            );
                                        }}
                                    />
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={details?.avatar || ''} alt={details?.name || 'Chat avatar'} />
                                        <AvatarFallback>{details?.name?.charAt(0) || ''}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-normal flex-1">
                                        {details?.name}
                                    </span>
                                </Label>
                            );
                        })}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleForward} disabled={selectedChats.length === 0}>Encaminhar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
