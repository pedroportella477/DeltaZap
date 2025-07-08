
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, Edit2, Sparkles, Wand2, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateImage } from "@/ai/flows/generate-image-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { useXmpp } from "@/context/xmpp-context";

const sampleAvatars = [
    'https://placehold.co/128x128.png',
    'https://placehold.co/128x128.png',
    'https://placehold.co/128x128.png',
    'https://placehold.co/128x128.png',
    'https://placehold.co/128x128.png',
    'https://placehold.co/128x128.png',
];

export default function ProfilePage() {
  const { jid } = useXmpp();
  const { toast } = useToast();

  const [name, setName] = useState(jid?.split('@')[0] || 'Usuário');
  const [status, setStatus] = useState("Disponível"); // Placeholder status
  const [avatar, setAvatar] = useState('https://placehold.co/128x128.png');
  
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // State for AI image generation
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);


  const handleSave = () => {
    // NOTE: In a real app, you'd save name and status to your backend/database.
    toast({
      title: "Perfil Atualizado",
      description: "Suas alterações foram salvas (visualmente).",
    });
  };
  
  const handleAvatarChange = (newAvatarUrl: string) => {
    // NOTE: In a real app, you'd upload this new avatar and save the URL.
    setAvatar(newAvatarUrl);
    setIsAvatarDialogOpen(false);
    setGeneratedImage(null);
    setGenerationPrompt("");
    toast({
      title: "Avatar Atualizado!",
      description: "Sua foto de perfil foi alterada (visualmente).",
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        handleAvatarChange(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!generationPrompt) {
        toast({ variant: 'destructive', title: 'Prompt vazio', description: 'Por favor, descreva a imagem que você quer gerar.' });
        return;
    }
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
        const imageUrl = await generateImage(generationPrompt);
        setGeneratedImage(imageUrl);
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erro na Geração', description: 'Não foi possível gerar a imagem. Tente novamente.' });
    } finally {
        setIsGenerating(false);
    }
  }

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
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="text-4xl">
                  {name.charAt(0)}
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
            <Tabs defaultValue="gallery" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="gallery">Galeria</TabsTrigger>
                    <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" />Carregar</TabsTrigger>
                    <TabsTrigger value="ai"><Sparkles className="mr-2 h-4 w-4"/>Gerar com IA</TabsTrigger>
                </TabsList>
                <TabsContent value="gallery">
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
                </TabsContent>
                <TabsContent value="upload">
                    <div className="py-4 space-y-4 flex flex-col items-center justify-center text-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary" onClick={() => imageInputRef.current?.click()}>
                        <Upload className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">Arraste um arquivo ou clique para carregar</p>
                        <Button variant="outline" className="pointer-events-none">
                            Escolher Arquivo
                        </Button>
                        <input
                            type="file"
                            ref={imageInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                        />
                    </div>
                </TabsContent>
                <TabsContent value="ai">
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-muted-foreground">Descreva a imagem que você quer criar. Seja criativo!</p>
                        <div className="flex gap-2">
                           <Input 
                                placeholder="Ex: um gato com chapéu de mago" 
                                value={generationPrompt} 
                                onChange={(e) => setGenerationPrompt(e.target.value)}
                                disabled={isGenerating}
                           />
                           <Button onClick={handleGenerateImage} disabled={isGenerating}>
                               <Wand2 className="mr-2 h-4 w-4" />
                               Gerar
                           </Button>
                        </div>
                        <div className="aspect-square w-full flex items-center justify-center rounded-md border border-dashed">
                           {isGenerating && <Skeleton className="w-full h-full" />}
                           {!isGenerating && generatedImage && (
                                <button onClick={() => handleAvatarChange(generatedImage)} className="w-full h-full relative group">
                                    <Image src={generatedImage} alt="Imagem gerada por IA" fill className="object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                        <p className="text-white font-semibold">Usar esta imagem</p>
                                    </div>
                                </button>
                           )}
                           {!isGenerating && !generatedImage && (
                               <p className="text-sm text-muted-foreground">Sua imagem aparecerá aqui.</p>
                           )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
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
