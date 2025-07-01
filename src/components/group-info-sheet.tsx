"use client";

import { useState, useEffect } from 'react';
import { getChatData, updateParticipantRole, removeParticipant } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { MoreVertical, ShieldCheck, Trash, UserPlus } from 'lucide-react';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

type ChatData = NonNullable<ReturnType<typeof getChatData>>;

interface GroupInfoSheetProps {
    chatId: string;
    onGroupUpdate: () => void;
}

export function GroupInfoSheet({ chatId, onGroupUpdate }: GroupInfoSheetProps) {
    const [chatData, setChatData] = useState<ChatData | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setChatData(getChatData(chatId));
    }, [chatId]);
    
    if (!chatData) return null;

    const currentUserRole = chatData.participants.find(p => p.id === 'user1')?.role;
    const isCurrentUserAdmin = currentUserRole === 'admin';

    const handleRoleChange = (userId: string, newRole: 'admin' | 'member') => {
        updateParticipantRole(chatId, userId, newRole);
        setChatData(getChatData(chatId)); // Refresh local state
        toast({ title: "Permissões atualizadas!" });
        onGroupUpdate();
    };

    const handleRemoveUser = (userId: string, userName: string) => {
        removeParticipant(chatId, userId);
        setChatData(getChatData(chatId)); // Refresh local state
        toast({
            title: "Usuário removido",
            description: `${userName} foi removido(a) do grupo.`
        });
        onGroupUpdate();
    };

    return (
        <>
            <SheetHeader className="p-4 border-b text-left">
                <SheetTitle className="text-xl">Dados do grupo</SheetTitle>
                <SheetDescription>Veja e gerencie os membros do grupo.</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col items-center p-6 bg-muted/50">
                <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={chatData.avatar} alt={chatData.name} />
                    <AvatarFallback className="text-3xl">{chatData.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold font-headline">{chatData.name}</h2>
                <p className="text-sm text-muted-foreground">{chatData.participants.length} membros</p>
            </div>
            <ScrollArea className="flex-grow">
                <div className="p-4">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">MEMBROS</h3>
                    {chatData.participants.map(participant => (
                        <div key={participant.id} className="flex items-center p-2 rounded-md hover:bg-muted/50 group">
                            <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={participant.avatar} alt={participant.name} />
                                <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <p className="font-semibold">{participant.id === 'user1' ? 'Você' : participant.name}</p>
                                {participant.role === 'admin' && (
                                    <Badge variant="secondary" className="h-5 text-xs px-1.5 py-0">Admin</Badge>
                                )}
                            </div>
                            {isCurrentUserAdmin && participant.id !== 'user1' && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {participant.role !== 'admin' && (
                                            <DropdownMenuItem onClick={() => handleRoleChange(participant.id, 'admin')}>
                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                <span>Tornar admin</span>
                                            </DropdownMenuItem>
                                        )}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                     <Trash className="mr-2 h-4 w-4" />
                                                     <span>Remover do grupo</span>
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Essa ação não pode ser desfeita. Isso irá remover permanentemente {participant.name} do grupo.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleRemoveUser(participant.id, participant.name)} className="bg-destructive hover:bg-destructive/90">Remover</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </>
    );
}
