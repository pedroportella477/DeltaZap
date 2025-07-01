"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [serverIp, setServerIp] = useState('');
  const [serverPort, setServerPort] = useState('');

  useEffect(() => {
    const savedIp = localStorage.getItem('xmpp_server_ip');
    const savedPort = localStorage.getItem('xmpp_server_port');
    if (savedIp) setServerIp(savedIp);
    if (savedPort) setServerPort(savedPort);
  }, []);

  const handleSave = () => {
    localStorage.setItem('xmpp_server_ip', serverIp);
    localStorage.setItem('xmpp_server_port', serverPort);
    toast({ title: "Configurações Salvas!", description: "O IP e a porta do servidor foram atualizados." });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Configurações do Servidor</h1>
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
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </CardContent>
      </Card>
    </div>
  );
}
