
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInternalLinks, InternalLink } from '@/lib/data';
import { Link as LinkIcon, ExternalLink } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LinksPage() {
  const [links, setLinks] = useState<InternalLink[]>([]);

  useEffect(() => {
    setLinks(getInternalLinks());
  }, []);

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="p-4 border-b">
        <CardTitle className="font-headline text-2xl">Links Internos</CardTitle>
        <CardDescription>Links úteis e importantes definidos pela administração.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-grow overflow-y-auto bg-muted/20">
        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <LinkIcon className="h-20 w-20 text-muted-foreground/30" />
            <h2 className="mt-6 text-xl font-semibold font-headline">Nenhum link disponível</h2>
            <p className="mt-2 text-sm">
              Quando links forem adicionados pela administração, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map(link => (
              <Card key={link.id}>
                <CardContent className="p-4 flex items-center justify-between">
                    <div className='flex items-center gap-4'>
                      <div className='p-2 bg-muted rounded-md'>
                        <LinkIcon className='h-6 w-6 text-muted-foreground'/>
                      </div>
                      <div>
                        <h3 className="font-semibold">{link.title}</h3>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline break-all">
                            {link.url}
                        </a>
                      </div>
                    </div>
                     <Button variant="ghost" size="sm" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          Abrir Link <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
}
