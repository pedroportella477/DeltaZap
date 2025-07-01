"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { users, statuses as initialStatuses, User } from "@/lib/data";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Camera, Edit, MoreHorizontal, Trash2 } from "lucide-react";
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function StatusPage() {
  const [currentUser, setCurrentUser] = useState<User>(users.find(u => u.id === 'user1')!);
  const [statuses, setStatuses] = useState(initialStatuses);
  const [newStatus, setNewStatus] = useState("");

  const handleStatusUpdate = () => {
    setCurrentUser(prev => ({ ...prev, status: newStatus }));
  };

  const getUserForStatus = (userId: string) => users.find(u => u.id === userId);

  return (
    <div className="h-full flex flex-col">
       <CardHeader className="p-4 border-b">
         <CardTitle className="font-headline text-2xl">Status</CardTitle>
       </CardHeader>
       <CardContent className="p-0 flex-grow overflow-y-auto">
        <div className="p-4">
          {/* Current User Status */}
          <div className="flex items-center space-x-4 cursor-pointer hover:bg-muted/50 p-2 rounded-lg">
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-background">
                <Camera className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>
            <div>
              <p className="font-semibold">Meu status</p>
              <p className="text-sm text-muted-foreground">{currentUser.status || "Nenhum status definido"}</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edite seu status</DialogTitle>
                </DialogHeader>
                <Textarea 
                  placeholder="O que você está pensando?"
                  defaultValue={currentUser.status}
                  onChange={(e) => setNewStatus(e.target.value)}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button onClick={handleStatusUpdate}>Salvar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground my-4">ATUALIZAÇÕES RECENTES</h3>

          {/* Other users' statuses */}
          {statuses.map(status => {
            const user = getUserForStatus(status.userId);
            if (!user) return null;

            return (
              <Dialog key={status.id}>
                <DialogTrigger asChild>
                  <div className="flex items-center space-x-4 mb-4 cursor-pointer hover:bg-muted/50 p-2 rounded-lg">
                    <Avatar className="h-14 w-14 border-2 border-accent">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(status.timestamp), { locale: ptBR, addSuffix: true })}</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-md p-0">
                  <div className="relative">
                    {status.type === 'image' ? (
                      <Image src={status.content} alt={`Status de ${user.name}`} width={400} height={700} className="rounded-t-lg object-cover w-full h-[70vh]"/>
                    ) : (
                      <div className="h-[70vh] flex items-center justify-center p-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg">
                        <p className="text-white text-3xl text-center font-headline">{status.content}</p>
                      </div>
                    )}
                    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
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
       </CardContent>
    </div>
  );
}
