"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { users, createGroupChat } from '@/lib/data';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const createGroupSchema = z.object({
  groupName: z.string().min(1, "O nome do grupo é obrigatório"),
  members: z.array(z.string()).min(1, "Selecione pelo menos um membro"),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

interface CreateGroupDialogProps {
  onGroupCreated: () => void;
}

export function CreateGroupDialog({ onGroupCreated }: CreateGroupDialogProps) {
  const { toast } = useToast();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      groupName: '',
      members: [],
    },
  });

  const availableUsers = users.filter(u => u.id !== 'user1' && u.id !== 'user5'); // Exclude current user and design team

  const onSubmit = (data: CreateGroupForm) => {
    createGroupChat(data.groupName, data.members);
    toast({
      title: "Grupo criado!",
      description: `O grupo "${data.groupName}" foi criado com sucesso.`,
    });
    onGroupCreated();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Criar novo grupo</DialogTitle>
        <DialogDescription>
          Escolha um nome e adicione membros ao seu novo grupo.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Nome do Grupo</Label>
            <Input id="groupName" {...register('groupName')} placeholder="Ex: Time de Futebol" />
            {errors.groupName && <p className="text-xs text-destructive">{errors.groupName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Adicionar Membros</Label>
            <ScrollArea className="h-48 rounded-md border p-2">
              <Controller
                name="members"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {availableUsers.map(user => (
                      <div key={user.id} className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted/50">
                        <Checkbox
                          id={`member-${user.id}`}
                          checked={field.value?.includes(user.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), user.id])
                              : field.onChange(field.value?.filter((value) => value !== user.id));
                          }}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Label htmlFor={`member-${user.id}`} className="font-normal flex-1 cursor-pointer">{user.name}</Label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </ScrollArea>
             {errors.members && <p className="text-xs text-destructive">{errors.members.message}</p>}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit">Criar Grupo</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
