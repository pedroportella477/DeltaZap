
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getInternalLinks, addInternalLink, updateInternalLink, deleteInternalLink, InternalLink } from '@/lib/data';
import { PlusCircle, Trash2, Edit, ExternalLink, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const linkSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  url: z.string().url("Por favor, insira uma URL válida."),
});

type LinkForm = z.infer<typeof linkSchema>;

export default function AdminLinksPage() {
  const [links, setLinks] = useState<InternalLink[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<InternalLink | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LinkForm>({
    resolver: zodResolver(linkSchema),
  });

  const refreshLinks = () => {
    setLinks(getInternalLinks());
  };

  useEffect(() => {
    refreshLinks();
  }, []);

  const handleOpenDialog = (link: InternalLink | null = null) => {
    setEditingLink(link);
    if (link) {
      setValue("title", link.title);
      setValue("url", link.url);
    } else {
      reset({ title: "", url: "" });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: LinkForm) => {
    setIsLoading(true);
    try {
      if (editingLink) {
        updateInternalLink(editingLink.id, data.title, data.url);
        toast({ title: "Link atualizado!" });
      } else {
        addInternalLink(data.title, data.url);
        toast({ title: "Link adicionado!" });
      }
      refreshLinks();
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "Ocorreu um erro", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteInternalLink(id);
    toast({ title: 'Link removido!', variant: 'destructive' });
    refreshLinks();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Gerenciar Links Internos</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Link
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Links existentes</CardTitle>
          <CardDescription>Adicione, edite ou remova os links que aparecerão para os usuários.</CardDescription>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum link cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {links.map(link => (
                <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg gap-4">
                  <div className="flex-grow overflow-hidden">
                    <p className="font-semibold">{link.title}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline break-all truncate">
                      {link.url}
                    </a>
                  </div>
                  <div className="flex items-center ml-4 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(link)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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
                          <AlertDialogAction onClick={() => handleDelete(link.id)} className="bg-destructive hover:bg-destructive/90">
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLink ? 'Editar Link' : 'Novo Link'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" {...register('title')} disabled={isLoading} placeholder="Ex: Portal do Colaborador" />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input id="url" {...register('url')} disabled={isLoading} placeholder="https://..." />
                {errors.url && <p className="text-sm text-destructive mt-1">{errors.url.message}</p>}
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
  );
}
