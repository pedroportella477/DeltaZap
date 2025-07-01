"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSharedLinks, deleteMessage, SharedLink } from '@/lib/data';
import { Link as LinkIcon, Trash2, ExternalLink } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function AdminLinksPage() {
  const [links, setLinks] = useState<SharedLink[]>([]);
  const { toast } = useToast();

  const refreshLinks = () => {
    setLinks(getSharedLinks());
  };

  useEffect(() => {
    refreshLinks();
  }, []);

  const handleDelete = (link: SharedLink) => {
    const messageId = link.id.split('-https')[0];
    const chatId = link.chat.id;
    
    deleteMessage(chatId, messageId);
    toast({ title: 'Link removido!', description: 'A mensagem contendo o link foi excluída.' });
    refreshLinks();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Gerenciar Links Internos</h1>
       <Card>
        <CardHeader>
            <CardTitle>Links Compartilhados</CardTitle>
            <CardDescription>Visualize e remova links compartilhados em todas as conversas.</CardDescription>
        </CardHeader>
        <CardContent>
            {links.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground/30" />
                    <p className="mt-4">Nenhum link compartilhado encontrado.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {links.map(link => (
                    <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-grow overflow-hidden">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline break-all">
                                {link.url}
                            </a>
                            <p className="text-sm text-muted-foreground truncate">
                                Em: {link.chat.name} | Por: {link.sender.name}
                            </p>
                        </div>
                        <div className="flex items-center ml-4">
                            <Button variant="ghost" size="sm" asChild>
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Isto removerá a mensagem original que contém o link. Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(link)} className="bg-destructive hover:bg-destructive/90">
                                        Remover
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    ))}
                </div>
            )}
        </CardContent>
       </Card>
    </div>
  );
}
