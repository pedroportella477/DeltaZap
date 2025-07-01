
"use client";

import { useState } from 'react';
import { Message as MessageType } from '@/lib/data';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { useXmpp } from '@/context/xmpp-context';

interface ForwardMessageDialogProps {
    message: MessageType | null;
    onClose: () => void;
    onForward: () => void;
}

export function ForwardMessageDialog({ message, onClose, onForward }: ForwardMessageDialogProps) {
    const [selectedChats, setSelectedChats] = useState<string[]>([]);
    const { toast } = useToast();
    const { chats, sendMessage } = useXmpp();

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

        selectedChats.forEach(chatId => {
            sendMessage(chatId, message.content, message.type, message.fileName);
        })

        toast({
            title: 'Mensagem encaminhada!',
            description: `Sua mensagem foi encaminhada para ${selectedChats.length} conversa(s).`,
        });
        onForward();
        onClose();
    };

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
                                        <AvatarImage src={chat.avatar || ''} alt={chat.name || 'Chat avatar'} />
                                        <AvatarFallback>{chat.name?.charAt(0) || ''}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-normal flex-1">
                                        {chat.name}
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
