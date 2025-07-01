
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getSupportMaterials, addSupportMaterial, deleteSupportMaterial, SupportMaterial } from '@/lib/data';
import { PlusCircle, Trash2, FileText, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const supportSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  content: z.string().min(1, "O conteúdo é obrigatório."),
  image: z.instanceof(FileList).optional(),
  document: z.instanceof(FileList).optional(),
});

type SupportForm = z.infer<typeof supportSchema>;

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function AdminSupportPage() {
  const [materials, setMaterials] = useState<SupportMaterial[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupportForm>({
    resolver: zodResolver(supportSchema),
  });

  const refreshMaterials = async () => {
    setIsFetching(true);
    try {
      const fetchedMaterials = await getSupportMaterials();
      setMaterials(fetchedMaterials);
    } catch (error) {
      toast({ title: "Erro ao carregar materiais", variant: "destructive" });
    } finally {
        setIsFetching(false);
    }
  };

  useEffect(() => {
    refreshMaterials();
  }, [toast]);

  const onSubmit = async (data: SupportForm) => {
    setIsLoading(true);
    try {
      let imageUrl: string | undefined = undefined;
      let documentUrl: string | undefined = undefined;
      let documentName: string | undefined = undefined;

      if (data.image && data.image.length > 0) {
        imageUrl = await fileToDataUrl(data.image[0]);
      }
      if (data.document && data.document.length > 0) {
        const docFile = data.document[0];
        documentUrl = await fileToDataUrl(docFile);
        documentName = docFile.name;
      }

      await addSupportMaterial({
        title: data.title,
        content: data.content,
        imageUrl,
        documentUrl,
        documentName,
      });
      
      toast({ title: "Material adicionado!" });
      await refreshMaterials();
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      toast({ title: "Erro ao processar anexos", variant: "destructive" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
        await deleteSupportMaterial(id);
        toast({ title: 'Material removido!', variant: 'destructive' });
        await refreshMaterials();
    } catch (error) {
         toast({ title: 'Erro ao remover material', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Gerenciar Material de Apoio</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Material de Apoio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" {...register('title')} disabled={isLoading} />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea id="content" {...register('content')} rows={5} disabled={isLoading} />
                {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="image">Imagem (opcional)</Label>
                    <Input id="image" type="file" accept="image/*" {...register('image')} disabled={isLoading} />
                </div>
                 <div>
                    <Label htmlFor="document">Documento (opcional)</Label>
                    <Input id="document" type="file" {...register('document')} disabled={isLoading} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isLoading}>Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materiais existentes</CardTitle>
          <CardDescription>Lista de todos os materiais de apoio disponíveis.</CardDescription>
        </CardHeader>
        <CardContent>
           {isFetching ? (
             <div className='flex justify-center items-center py-4'>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
           ) : materials.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum material de apoio cadastrado.</p>
          ) : (
            <div className="space-y-4">
              {materials.map(material => (
                <Card key={material.id} className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg">{material.title}</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1 mb-3">{material.content}</p>
                      
                      {material.imageUrl && (
                        <div className="mt-2 mb-3">
                            <Image src={material.imageUrl} alt={material.title} width={250} height={180} className="rounded-md object-cover border" data-ai-hint="document screenshot" />
                        </div>
                      )}
                      
                      {material.documentUrl && material.documentName && (
                        <a href={material.documentUrl} download={material.documentName}>
                          <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" /> {material.documentName}
                          </Button>
                        </a>
                      )}
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(material.id)} className="bg-destructive hover:bg-destructive/90">
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
