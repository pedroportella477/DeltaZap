"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSharedLinks, SharedLink } from '@/lib/data';
import { Link as LinkIcon, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LinksPage() {
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setLinks(getSharedLinks());
    setIsMounted(true);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="p-4 border-b">
        <CardTitle className="font-headline text-2xl">Links Compartilhados</CardTitle>
        <CardDescription>Todos os links compartilhados em suas conversas.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-grow overflow-y-auto bg-muted/20">
        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <LinkIcon className="h-20 w-20 text-muted-foreground/30" />
            <h2 className="mt-6 text-xl font-semibold font-headline">Nenhum link encontrado</h2>
            <p className="mt-2 text-sm">
              Quando links forem compartilhados nas conversas, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map(link => (
              <Card key={link.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-10 w-10'>
                        <AvatarImage src={link.chat.avatar} />
                        <AvatarFallback>{link.chat.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          <Link href={`/chat/${link.chat.id}`} className="hover:underline">{link.chat.name}</Link>
                        </CardTitle>
                        <CardDescription>
                          Enviado por {link.sender.name}
                        </CardDescription>
                      </div>
                    </div>
                     <Button variant="ghost" size="sm" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          Abrir Link <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline break-all">
                    {link.url}
                  </a>
                  <blockquote className="border-l-2 pl-3 text-sm text-muted-foreground italic">
                    {link.messageContent}
                  </blockquote>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground pt-4 justify-end">
                    {isMounted ? formatDistanceToNow(new Date(link.timestamp), { locale: ptBR, addSuffix: true }) : '...'}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
}
