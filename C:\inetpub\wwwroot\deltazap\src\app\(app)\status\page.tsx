
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getStatusesForRoster, addStatus, Status } from "@/lib/data";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Camera, Pencil, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useXmpp } from '@/context/xmpp-context';

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function StatusPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { userId, roster, jid } = useXmpp();

  const [isMounted, setIsMounted] = useState(false);
  const [isTextStatusDialogOpen, setIsTextStatusDialogOpen] = useState(false);
  const [isImageStatusDialogOpen, setIsImageStatusDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const refreshStatuses = useCallback(async () => {
    if (roster.length > 0 || userId) {
      setIsLoading(true);
      try {
        const userIdsToFetch = [...new Set([userId!, ...roster.map(r => r.jid)])];
        const fetchedStatuses = await getStatusesForRoster(userIdsToFetch);
        const sortedStatuses = fetchedStatuses.sort((a,b) => b.timestamp.toMillis() - a.timestamp.toMillis());
        setStatuses(sortedStatuses);
      } catch (error) {
        console.error("Failed to fetch statuses:", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os status." });
      } finally {
        setIsLoading(false);
      }
    }
  }, [roster, userId, toast]);

  useEffect(() => {
    setIsMounted(true);
    if(userId) {
        refreshStatuses();
    }
  }, [refreshStatuses, userId]);
  
  const myLastStatus = statuses.find(s => s.userId === userId);
  const recentUpdates = statuses.filter(s => s.userId !== userId);
  
  const currentUserInfo = {
      name: jid?.split('@')[0] || 'Eu',
      avatar: 'https://placehold.co/100x100.png'
  }

  const getUserForStatus = (statusUserId: string) => {
    if (statusUserId === userId) return currentUserInfo;
    const contact = roster.find(r => r.jid === statusUserId);
    return {
      name: contact?.name || statusUserId.split('@')[0] || 'Usuário desconhecido',
      avatar: 'https://placehold.co/100x100.png',
    };
  };

  const handleAddTextStatus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) return;
    const formData = new FormData(event.currentTarget);
    const text = formData.get('status-text') as string;

    if (text.trim()) {
      setIsSubmitting(true);
      try {
        await addStatus(userId, text, 'text');
        await refreshStatuses();
        toast({ title: "Status publicado!" });
        setIsTextStatusDialogOpen(false);
      } catch (error) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível publicar o status." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAddImageStatus = async () => {
    if (!userId || !imageFile) return;
    setIsSubmitting(true);
    try {
        const imageUrl = await fileToDataUrl(imageFile);
        await addStatus(userId, imageUrl, 'image');
        await refreshStatuses();
        toast({ title: "Status publicado!" });
        setIsImageStatusDialogOpen(false);
        setImageFile(null);
    } catch(error) {
       toast({ variant: "destructive", title: "Erro", description: "Não foi possível publicar a imagem." });
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
       <CardHeader className="p-4 border-b">
         <CardTitle className="font-headline text-2xl">Status</CardTitle>
       </CardHeader>
       <CardContent className="p-0 flex-grow overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex items-center space-x-4 cursor-pointer hover:bg-muted/50 p-2 rounded-lg -m-2 flex-grow">
                  <div className="relative">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={myLastStatus?.type === 'image' ? myLastStatus.content : currentUserInfo.avatar} data-ai-hint="person face" />
                      <AvatarFallback>{currentUserInfo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="font-semibold">Meu status</p>
                    <p className="text-sm text-muted-foreground">
                      {myLastStatus
                        ? (isMounted ? formatDistanceToNow(myLastStatus.timestamp.toDate(), { locale: ptBR, addSuffix: true }) : '...')
                        : "Toque para adicionar uma atualização"
                      }
                    </p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-md p-0">
                  {myLastStatus ? (
                    <div className="relative">
                      {myLastStatus.type === 'image' ? (
                        <Image src={myLastStatus.content} alt={`Status de ${currentUserInfo.name}`} width={400} height={700} className="rounded-t-lg object-cover w-full h-[70vh]" data-ai-hint="lifestyle" />
                      ) : (
                        <div className="h-[70vh] flex items-center justify-center p-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg">
                          <p className="text-white text-3xl text-center font-headline">{myLastStatus.content}</p>
                        </div>
                      )}
                      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUserInfo.avatar} />
                          </Avatar>
                          <p className="text-white font-semibold">{currentUserInfo.name}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <DialogHeader className='p-6'>
                      <DialogTitle>Meu status</DialogTitle>
                      <p className="text-muted-foreground pt-4 text-center">Você ainda não publicou um status.</p>
                    </DialogHeader>
                  )}
              </DialogContent>
            </Dialog>
            
            <div className="flex shrink-0 gap-3">
                <Dialog open={isTextStatusDialogOpen} onOpenChange={setIsTextStatusDialogOpen}>
                    <DialogTrigger asChild>
                         <Button size="icon" variant="secondary" className="rounded-full shadow-lg h-12 w-12"><Pencil className="h-5 w-5"/></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Criar status de texto</DialogTitle></DialogHeader>
                         <form onSubmit={handleAddTextStatus}>
                            <Textarea name="status-text" placeholder="O que você está pensando?" className="min-h-[200px] text-lg focus-visible:ring-transparent border-0 bg-secondary" disabled={isSubmitting} />
                            <DialogFooter className="mt-4">
                              <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Publicar
                              </Button>
                            </DialogFooter>
                         </form>
                    </DialogContent>
                </Dialog>
                <Dialog open={isImageStatusDialogOpen} onOpenChange={(isOpen) => { setIsImageStatusDialogOpen(isOpen); if(!isOpen) setImageFile(null); }}>
                    <DialogTrigger asChild>
                        <Button size="icon" className="rounded-full shadow-lg h-14 w-14"><Camera className="h-6 w-6"/></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2"><Camera /> Criar status com imagem</DialogTitle>
                        </DialogHeader>
                         <div className="py-4 space-y-4">
                             <Input 
                               type="file" 
                               accept="image/*"
                               onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                               disabled={isSubmitting}
                             />
                              {imageFile && (
                                <div className='flex justify-center'>
                                  <Image src={URL.createObjectURL(imageFile)} alt="Preview" width={200} height={200} className="rounded-md object-contain" />
                                </div>
                              )}
                            <Button onClick={handleAddImageStatus} disabled={!imageFile || isSubmitting} className="w-full">
                              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Publicar Imagem
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
          </div>


          <div className="border-t mt-4 pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">ATUALIZAÇÕES RECENTES</h3>
            
            {isLoading ? (
                 <div className="flex items-center justify-center p-8">
                     <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                 </div>
            ) : recentUpdates.length === 0 ? (
                <p className="text-muted-foreground text-sm p-2">Nenhuma atualização recente de seus contatos.</p>
            ) : (
              recentUpdates.map(status => {
                const user = getUserForStatus(status.userId);
                if (!user) return null;

                return (
                  <Dialog key={status.id}>
                    <DialogTrigger asChild>
                      <div className="flex items-center space-x-4 mb-4 cursor-pointer hover:bg-muted/50 p-2 rounded-lg -ml-2">
                        <Avatar className="h-14 w-14 border-2 border-accent">
                          <AvatarImage src={status.type === 'image' ? status.content : user.avatar} data-ai-hint="person face"/>
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {isMounted ? formatDistanceToNow(status.timestamp.toDate(), { locale: ptBR, addSuffix: true }) : '...'}
                          </p>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-md p-0">
                      <div className="relative">
                        {status.type === 'image' ? (
                          <Image src={status.content} alt={`Status de ${user.name}`} width={400} height={700} className="rounded-t-lg object-cover w-full h-[70vh]" data-ai-hint="lifestyle"/>
                        ) : (
                          <div className="h-[70vh] flex items-center justify-center p-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg">
                            <p className="text-white text-3xl text-center font-headline">{status.content}</p>
                          </div>
                        )}
                        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} data-ai-hint="person face" />
                            </Avatar>
                            <p className="text-white font-semibold">{user.name}</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })
            )}
          </div>
        </div>
       </CardContent>
    </div>
  );
}
