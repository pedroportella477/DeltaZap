
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Info, AlertTriangle, Database } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const [serverIp, setServerIp] = useState('');
  const [serverPort, setServerPort] = useState('');

  useEffect(() => {
    const savedIp = localStorage.getItem('xmpp_server_ip') || '';
    const savedPort = localStorage.getItem('xmpp_server_port') || '';
    setServerIp(savedIp);
    setServerPort(savedPort);
  }, []);

  const handleSaveXmpp = () => {
    localStorage.setItem('xmpp_server_ip', serverIp);
    localStorage.setItem('xmpp_server_port', serverPort);
    toast({ title: "Configurações XMPP Salvas localmente!", description: "As configurações foram salvas no seu navegador para facilitar o desenvolvimento." });
  };
  
  return (
    <div className='space-y-6'>
      <h1 className="text-3xl font-bold">Configurações Gerais</h1>
      
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Ambiente de Produção</AlertTitle>
        <AlertDescription>
          Para um ambiente de produção seguro, estas configurações devem ser definidas através de variáveis de ambiente no seu servidor (por exemplo, em um arquivo `.env.local` ou nas configurações de seu provedor de hospedagem), e não salvas aqui.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Conexão com Servidor XMPP (Openfire)</CardTitle>
          <CardDescription>
            Insira os dados do seu servidor. Estes dados serão usados pelo cliente para se conectar. Salvar aqui só afeta o seu navegador atual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="server-ip">Endereço do Servidor (IP ou domínio)</Label>
            <Input 
              id="server-ip" 
              placeholder="ex: xmpp.meudominio.com ou 192.168.1.10" 
              value={serverIp}
              onChange={(e) => setServerIp(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="server-port">Porta WebSocket (Geralmente 7070)</Label>
            <Input 
              id="server-port" 
              placeholder="ex: 7070" 
              value={serverPort}
              onChange={(e) => setServerPort(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveXmpp}>Salvar Apenas no Navegador</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuração do Banco de Dados (PostgreSQL)</CardTitle>
          <CardDescription>
            A conexão com o banco de dados PostgreSQL é configurada exclusivamente através de variáveis de ambiente para garantir a segurança.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="p-4 rounded-lg bg-muted/50 flex items-start gap-3">
              <Database className="h-5 w-5 text-primary mt-1 shrink-0"/>
              <div>
                <h4 className="font-semibold">Configuração via Variável de Ambiente</h4>
                 <p className="text-sm text-muted-foreground">
                   Para conectar o aplicativo ao seu banco de dados PostgreSQL, você deve definir a variável de ambiente `POSTGRES_URL` no seu servidor.
                 </p>
                 <code className='mt-2 block text-xs bg-gray-700 text-white p-2 rounded'>
                    POSTGRES_URL="postgres://SEU_USUARIO:SUA_SENHA@SEU_HOST:SUA_PORTA/SEU_BANCO"
                 </code>
                 <p className="text-xs text-muted-foreground mt-2">
                    Nenhuma configuração é necessária nesta interface. O aplicativo lerá a variável de ambiente automaticamente ao iniciar.
                 </p>
              </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
