
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from '@/components/ui/toaster';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'master' && password === '@Delta477') {
      Cookies.set('admin-auth', 'true', { expires: 1, path: '/' });
      toast({ title: "Login bem-sucedido!" });
      router.push('/admin/dashboard');
      router.refresh(); 
    } else {
      setError('Credenciais inválidas.');
      toast({ variant: 'destructive', title: 'Erro de Login', description: 'Credenciais inválidas.' });
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Painel Administrativo</CardTitle>
            <CardDescription>Acesso restrito.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="username">Usuário</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Entrar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </>
  );
}
