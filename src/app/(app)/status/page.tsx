"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { users, statuses as initialStatuses, User, Status } from "@/lib/data";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Camera, Pencil, Wand2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Skeleton } from '@/components/ui/skeleton';


export default function StatusPage() {
  const [statuses, setStatuses] = useState(initialStatuses);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [isAiImageDialogOpen, setIsAiImageDialogOpen] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTextStatusDialogOpen, setIsTextStatusDialogOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentUser = users.find(u => u.id === 'user1')!;
  const myLastStatus = statuses
    .filter(s => s.userId === 'user1')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  // Group statuses by user, showing only the latest one per user
  const recentUpdates = Object.values(
    statuses
      .filter(s => s.userId !== 'user1')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .reduce((acc, status) => {
        if (!acc[status.userId]) {
          acc[status.userId] = status;
        }
        return acc;
      }, {} as Record<string, Status>)
  );

  const getUserForStatus = (userId: string) => users.find(u => u.id === userId);

  const handleAddTextStatus = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const text = formData.get('status-text') as string;

    if (text.trim()) {
      const newStatus: Status = {
        id: `status${Date.now()}`,
        userId: 'user1',
        content: text,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setStatuses(prev => [newStatus, ...prev]);
      toast({ title: "Status publicado!" });
      setIsTextStatusDialogOpen(false);
    }
  };

  const handleAddImageStatus = (imageUrl: string) => {
    const newStatus: Status = {
      id: `status${Date.now()}`,
      userId: 'user1',
      content: imageUrl,
      timestamp: new Date().toISOString(),
      type: 'image'
    };
    setStatuses(prev => [newStatus, ...prev]);
    toast({ title: "Status publicado!" });
    setIsAiImageDialogOpen(false);
    setGenerationPrompt("");
  };
  
  const handleGenerateImage = async () => {
    if (!generationPrompt) {
        toast({ variant: 'destructive', title: 'Prompt vazio', description: 'Por favor, descreva a imagem que você quer gerar.' });
        return;
    }
    setIsGenerating(true);
    try {
        const imageUrl = await generateImage(generationPrompt);
        handleAddImageStatus(imageUrl);
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erro na Geração', description: 'Não foi possível gerar a imagem. Tente novamente.' });
    } finally {
        setIsGenerating(false);
    }
  }


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
                      <AvatarImage src={myLastStatus?.type === 'image' ? myLastStatus.content : currentUser.avatar} data-ai-hint="person face" />
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="font-semibold">Meu status</p>
                    <p className="text-sm text-muted-foreground">
                      {myLastStatus
                        ? (isMounted ? formatDistanceToNow(new Date(myLastStatus.timestamp), { locale: ptBR, addSuffix: true }) : '...')
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
                        <Image src={myLastStatus.content} alt={`Status de ${currentUser.name}`} width={400} height={700} className="rounded-t-lg object-cover w-full h-[70vh]" data-ai-hint="lifestyle" />
                      ) : (
                        <div className="h-[70vh] flex items-center justify-center p-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg">
                          <p className="text-white text-3xl text-center font-headline">{myLastStatus.content}</p>
                        </div>
                      )}
                      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.avatar} />
                          </Avatar>
                          <p className="text-white font-semibold">{currentUser.name}</p>
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
                            <Textarea name="status-text" placeholder="O que você está pensando?" className="min-h-[200px] text-lg focus-visible:ring-transparent border-0 bg-secondary" />
                            <DialogFooter className="mt-4">
                              <Button type="submit">Publicar</Button>
                            </DialogFooter>
                         </form>
                    </DialogContent>
                </Dialog>
                <Dialog open={isAiImageDialogOpen} onOpenChange={setIsAiImageDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="icon" className="rounded-full shadow-lg h-14 w-14"><Camera className="h-6 w-6"/></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2"><Sparkles /> Criar status com IA</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center gap-4 py-4">
                          <p className="text-muted-foreground text-center text-sm">Descreva a imagem que você quer postar no seu status.</p>
                            <Input 
                              placeholder="Ex: um dia chuvoso visto da janela" 
                              value={generationPrompt} 
                              onChange={(e) => setGenerationPrompt(e.target.value)}
                              disabled={isGenerating}
                            />
                            <Button onClick={handleGenerateImage} disabled={isGenerating} className="w-full">
                              {isGenerating ? 'Gerando...' : 'Gerar e Publicar'}
                            </Button>
                            {isGenerating && <Skeleton className="h-20 w-full rounded-md" />}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
          </div>


          <div className="border-t mt-4 pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">ATUALIZAÇÕES RECENTES</h3>
            
            {recentUpdates.length === 0 && <p className="text-muted-foreground text-sm p-2">Nenhuma atualização recente de seus contatos.</p>}

            {recentUpdates.map(status => {
              const user = getUserForStatus(status.userId);
              if (!user) return null;

              return (
                <Dialog key={status.id}>
                  <DialogTrigger asChild>
                    <div className="flex items-center space-x-4 mb-4 cursor-pointer hover:bg-muted/50 p-2 rounded-lg -ml-2">
                      <Avatar className="h-14 w-14 border-2 border-accent">
                        <AvatarImage src={user.avatar} data-ai-hint="person face"/>
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {isMounted ? formatDistanceToNow(new Date(status.timestamp), { locale: ptBR, addSuffix: true }) : '...'}
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
            })}
          </div>
        </div>
       </CardContent>
    </div>
  );
}
