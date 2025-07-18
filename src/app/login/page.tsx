
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { useXmpp } from '@/context/xmpp-context';

const loginSchema = z.object({
  jid: z.string().min(1, "O campo de usuário é obrigatório").refine(
    (value) => value.toLowerCase() === 'master' || value.includes('@'),
    { message: "Por favor, insira um JID válido ou 'master'." }
  ),
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

const Logo = () => (
    <div className="flex flex-col items-center" data-ai-hint="logo chat">
        <div className="bg-primary/10 p-3 rounded-full border-4 border-primary/20 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-primary drop-shadow-lg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        </div>
        <h1 className="font-headline text-5xl font-bold tracking-tighter bg-gradient-to-r from-primary via-accent to-blue-500 bg-clip-text text-transparent pt-2 drop-shadow-sm">
            DeltaZap
        </h1>
    </div>
)


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { connect, loginAsMaster, status, error } = useXmpp();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
        jid: '',
        password: '',
    }
  });

  useEffect(() => {
    if (status === 'online') {
      toast({ title: "Login bem-sucedido!", description: "Bem-vindo(a) de volta!" });
      router.push('/chat');
    }
    if (status === 'error' && error) {
      toast({ variant: 'destructive', title: 'Erro de Login', description: error });
      setIsLoading(false);
    }
  }, [status, error, router, toast]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    if (data.jid.toLowerCase() === 'master' && data.password === '@Delta477') {
        await loginAsMaster();
    } else {
        await connect(data.jid, data.password);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background bg-whatsapp-doodles p-4">
      <Card className="w-full max-w-sm shadow-2xl bg-card/90 dark:bg-card/70 backdrop-blur-lg border border-primary/10">
        <CardHeader className="items-center text-center">
            <Logo />
            <div className='pt-4'>
                <CardTitle>Bem-vindo(a)!</CardTitle>
                <CardDescription>A mais eficiente plataforma de comunicação corporativa</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jid">Usuário (JID)</Label>
              <Input
                id="jid"
                placeholder="usuario@servidor.com ou master"
                {...register('jid')}
                disabled={isLoading}
              />
              {errors.jid && <p className="text-sm text-destructive mt-1">{errors.jid.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
       <footer className="absolute bottom-4 text-center text-xs text-muted-foreground">
         © {new Date().getFullYear()} - Desenvolvido por Pedro Portella Dev
      </footer>
    </div>
  );
}
