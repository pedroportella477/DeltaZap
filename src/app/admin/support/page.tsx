"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getSupportMaterials, addSupportMaterial, deleteSupportMaterial, SupportMaterial } from '@/lib/data';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const supportSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  content: z.string().min(1, "O conteúdo é obrigatório."),
});

type SupportForm = z.infer<typeof supportSchema>;

export default function AdminSupportPage() {
  const [materials, setMaterials] = useState<SupportMaterial[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupportForm>({
    resolver: zodResolver(supportSchema),
  });

  const refreshMaterials = () => {
    setMaterials(getSupportMaterials());
  };

  useEffect(() => {
    refreshMaterials();
  }, []);

  const onSubmit = (data: SupportForm) => {
    addSupportMaterial(data.title, data.content);
    toast({ title: "Material adicionado!" });
    refreshMaterials();
    setIsDialogOpen(false);
    reset();
  };

  const handleDelete = (id: string) => {
    deleteSupportMaterial(id);
    toast({ title: 'Material removido!', variant: 'destructive' });
    refreshMaterials();
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
                            <Input id="title" {...register('title')} />
                            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="content">Conteúdo</Label>
                            <Textarea id="content" {...register('content')} rows={10} />
                            {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Salvar</Button>
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
                {materials.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Nenhum material de apoio cadastrado.</p>
                ) : (
                    <div className="space-y-4">
                        {materials.map(material => (
                            <Card key={material.id} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{material.title}</h3>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{material.content}</p>
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
                                                <AlertDialogDescription>
                                                    Esta ação não pode ser desfeita.
                                                </AlertDialogDescription>
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
