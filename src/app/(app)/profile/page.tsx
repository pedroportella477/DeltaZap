"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { users } from "@/lib/data";
import { Camera, Edit2 } from "lucide-react";

const sampleAvatars = [
    'https://placehold.co/128x128.png',
    'https://placehold.co/128x128.png',
    'https://placehold.co/128x128.png',
    'https://placehold.co/128x128.png',
    'https://placehold.co/128x128.png',
    'https://placehold.co/128x128.png',
];

export default function ProfilePage() {
  const [user, setUser] = useState(users.find((u) => u.id === "user1")!);
  const [name, setName] = useState(user.name);
  const [status, setStatus] = useState(user.status);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setUser({ ...user, name, status });
    toast({
      title: "Perfil Atualizado",
      description: "Suas alterações foram salvas.",
    });
  };
  
  const handleAvatarChange = (newAvatarUrl: string) => {
    setUser(prev => ({ ...prev, avatar: newAvatarUrl }));
    setIsAvatarDialogOpen(false);
    toast({
      title: "Avatar Atualizado!",
      description: "Sua foto de perfil foi alterada.",
    });
  };

  return (
    <div className="h-full flex flex-col">
       <CardHeader className="p-4 border-b">
         <CardTitle className="font-headline text-2xl">Perfil</CardTitle>
       </CardHeader>
       <CardContent className="p-6 flex-grow overflow-y-auto flex flex-col items-center">
        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
          <DialogTrigger asChild>
            <div className="relative group cursor-pointer mb-6">
              <Avatar className="h-32 w-32 ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-4xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Escolha um novo avatar</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 py-4">
              {sampleAvatars.map((avatarUrl, index) => (
                <button 
                  key={index} 
                  className="rounded-full overflow-hidden aspect-square relative group focus:ring-2 focus:ring-ring" 
                  onClick={() => handleAvatarChange(avatarUrl)}
                >
                  <Image src={avatarUrl} alt={`Avatar ${index + 1}`} width={100} height={100} className="w-full h-full object-cover" data-ai-hint="person portrait" />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground">Seu Nome</Label>
                <div className="flex items-center gap-2">
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="text-lg" />
                    <Edit2 className="h-5 w-5 text-muted-foreground" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="status" className="text-muted-foreground">Sobre</Label>
                 <div className="flex items-center gap-2">
                    <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} />
                    <Edit2 className="h-5 w-5 text-muted-foreground" />
                </div>
            </div>

            <Button onClick={handleSave} className="w-full" size="lg">
                Salvar Alterações
            </Button>
        </div>
       </CardContent>
    </div>
  );
}
