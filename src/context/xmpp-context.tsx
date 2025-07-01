
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { client, xml } from '@xmpp/client';
import type { XmppClient } from '@xmpp/client';
import Cookies from 'js-cookie';

type XmppStatus = 'disconnected' | 'connecting' | 'online' | 'error' | 'restoring';

export interface RosterItem {
  jid: string;
  name?: string;
  subscription: 'both' | 'to' | 'from' | 'none' | 'remove';
  groups: string[];
}

interface XmppContextType {
  client: XmppClient | null;
  status: XmppStatus;
  jid: string | null;
  userId: string | null;
  error: string | null;
  roster: RosterItem[];
  connect: (jid: string, password: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

const XmppContext = createContext<XmppContextType | undefined>(undefined);

export const XmppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [xmppClient, setXmppClient] = useState<XmppClient | null>(null);
  const [status, setStatus] = useState<XmppStatus>('disconnected');
  const [jid, setJid] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roster, setRoster] = useState<RosterItem[]>([]);

  const connect = useCallback(async (jidStr: string, passwordStr: string) => {
    // If a client instance exists, stop it before creating a new one.
    if (xmppClient) {
      await xmppClient.stop().catch(console.error);
    }
    
    setStatus('connecting');
    setError(null);
    setRoster([]);

    try {
      const serverIp = typeof window !== 'undefined' ? localStorage.getItem('xmpp_server_ip') : 'localhost';
      const serverPort = typeof window !== 'undefined' ? localStorage.getItem('xmpp_server_port') : '7070';
      const service = `ws://${serverIp}:${serverPort}/ws-xmpp`;

      const [username, domain] = jidStr.split('@');
      if (!username || !domain) {
          throw new Error("JID inválido. Deve estar no formato usuario@servidor.com");
      }

      const newClient = client({
        service,
        domain,
        resource: 'webapp',
        username,
        password: passwordStr,
      });

      // Centralized cleanup logic
      const cleanup = () => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('xmpp_jid');
            sessionStorage.removeItem('xmpp_password');
        }
        Cookies.remove('auth-jid');
        Cookies.remove('auth-userId');
        setJid(null);
        setUserId(null);
        setRoster([]);
        setXmppClient(null);
      }

      newClient.on('error', (err) => {
        console.error('XMPP Error:', err);
        setStatus('error');
        setError('Falha na autenticação. Verifique suas credenciais e a conexão com o servidor.');
        cleanup();
        newClient.stop().catch(console.error);
      });

      newClient.on('offline', () => {
        setStatus('disconnected');
        cleanup();
      });

      newClient.on('online', async (address) => {
        console.log('Online as', address.toString());
        await newClient.send(xml('presence'));
        
        // Fetch the roster
        const rosterStanza = await newClient.iqCaller.request(
          xml('iq', { type: 'get' }, xml('query', { xmlns: 'jabber:iq:roster' }))
        );
        const items = rosterStanza.getChild('query')?.getChildren('item').map(item => ({
          jid: item.getAttr('jid'),
          name: item.getAttr('name'),
          subscription: item.getAttr('subscription'),
          groups: item.getChildren('group').map(g => g.getText()),
        })) || [];
        setRoster(items as RosterItem[]);
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('xmpp_jid', jidStr);
          sessionStorage.setItem('xmpp_password', passwordStr);
        }
        Cookies.set('auth-jid', address.toString(), { expires: 1 });
        Cookies.set('auth-userId', address.bare().toString(), { expires: 1 });
        
        setJid(address.toString());
        setUserId(address.bare().toString());
        setStatus('online');
      });

      setXmppClient(newClient);
      await newClient.start();

    } catch (e: any) {
      console.error(e);
      setStatus('error');
      setError(e.message || 'Ocorreu um erro inesperado durante a conexão.');
    }
  }, [xmppClient]);

  const disconnect = useCallback(async () => {
    if (xmppClient) {
      try {
        await xmppClient.stop();
      } catch (e) {
        console.error('Error during disconnect:', e);
      }
    }
    // The 'offline' handler will perform the cleanup
  }, [xmppClient]);
  
  // Effect to restore session on initial load
  useEffect(() => {
    const savedJid = sessionStorage.getItem('xmpp_jid');
    const savedPassword = sessionStorage.getItem('xmpp_password');
    if (savedJid && savedPassword) {
      setStatus('restoring');
      connect(savedJid, savedPassword);
    } else {
      setStatus('disconnected');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <XmppContext.Provider value={{ client: xmppClient, status, jid, userId, error, connect, disconnect, roster }}>
      {status === 'restoring' ? (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <p>Restaurando sessão...</p>
        </div>
      ) : children}
    </XmppContext.Provider>
  );
};

export const useXmpp = (): XmppContextType => {
  const context = useContext(XmppContext);
  if (context === undefined) {
    throw new Error('useXmpp must be used within a XmppProvider');
  }
  return context;
};
