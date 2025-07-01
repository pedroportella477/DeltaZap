
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { client, xml } from '@xmpp/client';
import type { XmppClient } from '@xmpp/client';
import Cookies from 'js-cookie';

type XmppStatus = 'disconnected' | 'connecting' | 'online' | 'error';

interface XmppContextType {
  client: XmppClient | null;
  status: XmppStatus;
  jid: string | null;
  userId: string | null;
  error: string | null;
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

  const connect = useCallback(async (jidStr: string, passwordStr: string) => {
    if (xmppClient) {
      await xmppClient.stop();
    }
    
    setStatus('connecting');
    setError(null);

    try {
      const [username, domain] = jidStr.split('@');
      const service = `ws://localhost:7070/ws-xmpp`;

      const newClient = client({
        service,
        domain,
        resource: 'webapp',
        username,
        password: passwordStr,
      });

      setXmppClient(newClient);

      newClient.on('error', (err) => {
        console.error('XMPP Error:', err);
        setStatus('error');
        setError('Falha na autenticação. Verifique suas credenciais e a conexão com o servidor.');
        newClient.stop().catch(console.error);
      });

      newClient.on('offline', () => {
        setStatus('disconnected');
        setJid(null);
        setUserId(null);
        Cookies.remove('auth-jid');
        Cookies.remove('auth-userId');
      });

      newClient.on('online', async (address) => {
        console.log('Online as', address.toString());
        await newClient.send(xml('presence'));
        setStatus('online');
        setJid(address.toString());
        setUserId(address.bare().toString());
        Cookies.set('auth-jid', address.toString(), { expires: 1 });
        Cookies.set('auth-userId', address.bare().toString(), { expires: 1 });
      });

      await newClient.start();
    } catch (e) {
      console.error(e);
      setStatus('error');
      setError('Ocorreu um erro inesperado durante a conexão.');
    }
  }, [xmppClient]);

  const disconnect = useCallback(async () => {
    if (xmppClient) {
      try {
        await xmppClient.stop();
      } catch (e) {
        console.error('Error during disconnect:', e);
      } finally {
        setXmppClient(null);
        setStatus('disconnected');
        setJid(null);
        setUserId(null);
      }
    }
  }, [xmppClient]);
  

  return (
    <XmppContext.Provider value={{ client: xmppClient, status, jid, userId, error, connect, disconnect }}>
      {children}
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
