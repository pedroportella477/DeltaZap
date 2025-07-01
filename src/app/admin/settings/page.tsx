"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info } from 'lucide-react';

export default function AdminSettingsPage() {
  const { toast } = useToast();

  // State for XMPP Server settings
  const [serverIp, setServerIp] = useState('');
  const [serverPort, setServerPort] = useState('');

  // State for Database settings (for UI demonstration)
  const [dbHost, setDbHost] = useState('');
  const [dbPort, setDbPort] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [dbPassword, setDbPassword] = useState('');
  const [dbName, setDbName] = useState('');
  const [dbConnectionString, setDbConnectionString] = useState('');


  useEffect(() => {
    // Load XMPP settings from localStorage
    const savedIp = localStorage.getItem('xmpp_server_ip');
    const savedPort = localStorage.getItem('xmpp_server_port');
    if (savedIp) setServerIp(savedIp);
    if (savedPort) setServerPort(savedPort);
  }, []);

  const handleSaveXmpp = () => {
    localStorage.setItem('xmpp_server_ip', serverIp);
    localStorage.setItem('xmpp_server_port', serverPort);
    toast({ title: "Configurações XMPP Salvas!", description: "O IP e a porta do servidor foram atualizados." });
  };

  const handleSaveDb = () => {
    toast({ 
      title: "Interface de Demonstração", 
      description: "As configurações do banco de dados foram salvas visualmente. A lógica de backend não está implementada." 
    });
  }

  return (
    <div className='space-y-6'>
      <h1 className="text-3xl font-bold">Configurações Gerais</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Conexão com Servidor XMPP (Openfire)</CardTitle>
          <CardDescription>
            Insira os dados do seu servidor. Estes dados serão usados pelo cliente para se conectar.
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
            <Label htmlFor="server-port">Porta WebSocket</Label>
            <Input 
              id="server-port" 
              placeholder="ex: 7070" 
              value={serverPort}
              onChange={(e) => setServerPort(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveXmpp}>Salvar Configurações XMPP</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuração do Banco de Dados</CardTitle>
          <CardDescription>
            Defina a conexão com o banco de dados para armazenar informações do aplicativo (anotações, materiais de apoio, etc).
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="firestore" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="firestore">Firestore</TabsTrigger>
              <TabsTrigger value="mysql">MySQL/MariaDB</TabsTrigger>
              <TabsTrigger value="postgres">PostgreSQL</TabsTrigger>
              <TabsTrigger value="mongodb">MongoDB</TabsTrigger>
            </TabsList>

            <TabsContent value="firestore" className="pt-4">
               <div className="p-4 rounded-lg bg-muted/50 flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-1 shrink-0"/>
                  <div>
                    <h4 className="font-semibold">Solução Recomendada</h4>
                     <p className="text-sm text-muted-foreground">
                       A configuração do Firebase Firestore é gerenciada através das variáveis de ambiente no seu projeto Firebase, garantindo segurança e integração nativa. Nenhuma configuração adicional é necessária aqui.
                     </p>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="mysql" className="pt-4 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="mysql-host">Host</Label>
                    <Input id="mysql-host" value={dbHost} onChange={e => setDbHost(e.target.value)} placeholder="localhost" />
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor="mysql-port">Porta</Label>
                    <Input id="mysql-port" value={dbPort} onChange={e => setDbPort(e.target.value)} placeholder="3306" />
                  </div>
               </div>
                <div className="space-y-1">
                  <Label htmlFor="mysql-db">Nome do Banco</Label>
                  <Input id="mysql-db" value={dbName} onChange={e => setDbName(e.target.value)} placeholder="deltazap_db" />
                </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="mysql-user">Usuário</Label>
                    <Input id="mysql-user" value={dbUser} onChange={e => setDbUser(e.target.value)} placeholder="root" />
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor="mysql-pass">Senha</Label>
                    <Input id="mysql-pass" type="password" value={dbPassword} onChange={e => setDbPassword(e.target.value)} />
                  </div>
               </div>
            </TabsContent>

             <TabsContent value="postgres" className="pt-4 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="pg-host">Host</Label>
                    <Input id="pg-host" value={dbHost} onChange={e => setDbHost(e.target.value)} placeholder="localhost" />
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor="pg-port">Porta</Label>
                    <Input id="pg-port" value={dbPort} onChange={e => setDbPort(e.target.value)} placeholder="5432" />
                  </div>
               </div>
                <div className="space-y-1">
                  <Label htmlFor="pg-db">Nome do Banco</Label>
                  <Input id="pg-db" value={dbName} onChange={e => setDbName(e.target.value)} placeholder="deltazap_db" />
                </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="pg-user">Usuário</Label>
                    <Input id="pg-user" value={dbUser} onChange={e => setDbUser(e.target.value)} placeholder="postgres" />
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor="pg-pass">Senha</Label>
                    <Input id="pg-pass" type="password" value={dbPassword} onChange={e => setDbPassword(e.target.value)} />
                  </div>
               </div>
            </TabsContent>
            
            <TabsContent value="mongodb" className="pt-4 space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="mongo-uri">Connection String</Label>
                    <Input id="mongo-uri" value={dbConnectionString} onChange={e => setDbConnectionString(e.target.value)} placeholder="mongodb+srv://user:pass@cluster.mongodb.net/dbname" />
                </div>
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4 mt-4 flex justify-end">
              <Button onClick={handleSaveDb}>Salvar Configurações do Banco</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
