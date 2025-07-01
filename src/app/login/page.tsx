
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Cookies from 'js-cookie';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { useXmpp } from '@/context/xmpp-context';

const loginSchema = z.object({
  jid: z.string().email("Por favor, insira um JID válido (ex: usuario@servidor.com)"),
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

const Logo = () => (
    <div className="flex items-center gap-2" data-ai-hint="logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
        <h1 className="text-xl font-bold font-headline text-foreground">DeltaZap</h1>
    </div>
)

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { connect, status, error } = useXmpp();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
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
    await connect(data.jid, data.password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-whatsapp-doodles p-4">
      <Card className="w-full max-w-sm shadow-2xl bg-card/80 dark:bg-card/60 backdrop-blur-lg">
        <CardHeader className="text-center">
          <div className='flex justify-center mb-4'>
            <Logo />
          </div>
          <CardTitle>Bem-vindo(a) de volta!</CardTitle>
          <CardDescription>Faça login na sua conta Openfire para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jid">Usuário (JID)</Label>
              <Input
                id="jid"
                placeholder="usuario@servidor.com"
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
    </div>
  );
}
