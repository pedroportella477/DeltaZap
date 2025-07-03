
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { getSupportMaterials, SupportMaterial } from '@/lib/data';
import { Loader2, BookOpen, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SupportPage() {
  const [materials, setMaterials] = useState<SupportMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const fetchedMaterials = await getSupportMaterials();
        setMaterials(fetchedMaterials);
      } catch (error) {
        toast({ title: "Erro ao carregar materiais", description: "Não foi possível buscar o material de apoio.", variant: "destructive" });
        console.error("Failed to fetch support materials:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaterials();
  }, [toast]);

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="p-4 border-b">
        <CardTitle className="font-headline text-2xl">Material de Apoio</CardTitle>
        <CardDescription>Tutoriais, guias e documentos úteis para a equipe.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-grow overflow-y-auto bg-muted/20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Loader2 className="h-20 w-20 text-muted-foreground/30 animate-spin" />
            <p className="mt-6 text-xl font-semibold font-headline">Carregando materiais...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <BookOpen className="h-20 w-20 text-muted-foreground/30" />
            <h2 className="mt-6 text-xl font-semibold font-headline">Nenhum material disponível</h2>
            <p className="mt-2 text-sm">
              Quando a administração adicionar materiais, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map(material => (
              <Card key={material.id}>
                 <CardHeader>
                    <CardTitle>{material.title}</CardTitle>
                 </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap mb-4">{material.content}</p>
                  
                  {material.imageUrl && (
                    <div className="mt-2 mb-3">
                      <Image src={material.imageUrl} alt={material.title} width={300} height={200} className="rounded-md object-cover border" data-ai-hint="document screenshot" />
                    </div>
                  )}
                  
                  {material.documentUrl && material.documentName && (
                    <a href={material.documentUrl} download={material.documentName} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" /> Baixar {material.documentName}
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
}
