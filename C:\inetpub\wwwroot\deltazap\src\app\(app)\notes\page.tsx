
"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getNotes, addNote, updateNote, deleteNote, Note } from "@/lib/data";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useXmpp } from "@/context/xmpp-context";

const noteSchema = z.object({
  title: z.string().min(1, "O título é obrigatório").max(50, "O título não pode ter mais de 50 caracteres."),
  content: z.string().min(1, "O conteúdo é obrigatório."),
});

type NoteForm = z.infer<typeof noteSchema>;

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();
  const { userId } = useXmpp();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<NoteForm>({
    resolver: zodResolver(noteSchema),
  });

  const refreshNotes = useCallback(async () => {
    if (userId) {
      try {
        const userNotes = await getNotes(userId);
        setNotes(userNotes);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as anotações.' });
      }
    }
  }, [userId, toast]);

  useEffect(() => {
    refreshNotes();
    setIsMounted(true);
  }, [refreshNotes]);

  const handleOpenDialog = (note: Note | null = null) => {
    setEditingNote(note);
    if (note) {
      setValue("title", note.title);
      setValue("content", note.content);
    } else {
      reset({ title: "", content: "" });
    }
    setIsNoteDialogOpen(true);
  };

  const onSubmit = async (data: NoteForm) => {
    if (!userId) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
      return;
    }
    try {
      if (editingNote) {
        await updateNote(editingNote.id, data.title, data.content);
        toast({ title: "Anotação atualizada!" });
      } else {
        await addNote(userId, data.title, data.content);
        toast({ title: "Anotação criada!" });
      }
      await refreshNotes();
      setIsNoteDialogOpen(false);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  };
  
  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      toast({ title: "Anotação excluída!" });
      await refreshNotes();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro', description: "Não foi possível remover a anotação." });
    }
  };


  return (
    <div className="h-full flex flex-col">
      <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-2xl">Minhas Anotações</CardTitle>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Anotação
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-grow overflow-y-auto bg-muted/20">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
             <p className="text-lg font-medium">Nenhuma anotação ainda.</p>
             <p className="text-sm">Clique em "Criar Anotação" para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {notes.map((note) => (
              <Card key={note.id} className={cn("flex flex-col border", note.color)}>
                <CardHeader className="flex-row items-start justify-between pb-2">
                  <CardTitle className="text-lg font-semibold break-all">{note.title}</CardTitle>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(note)}>
                           <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Remover
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita e irá remover a anotação permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteNote(note.id)} className="bg-destructive hover:bg-destructive/90">Remover</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm whitespace-pre-wrap break-words">{note.content}</p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground pt-4 justify-end">
                    {isMounted && note.timestamp ? formatDistanceToNow(note.timestamp, { locale: ptBR, addSuffix: true }) : '...'}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
       
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingNote ? 'Editar Anotação' : 'Criar Nova Anotação'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" {...register('title')} />
                    {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
                </div>
                <div>
                    <Label htmlFor="content">Conteúdo</Label>
                    <Textarea id="content" {...register('content')} rows={8} />
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
  );
}
