
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { client, xml } from '@xmpp/client';
import type { XmppClient, Stanza } from '@xmpp/client';
import Cookies from 'js-cookie';
import { Chat, Message, User, UserPresence, addMessage, getChats } from '@/lib/data';
import { serverTimestamp } from 'firebase/firestore';


type XmppStatus = 'disconnected' | 'connecting' | 'online' | 'error' | 'restoring';

export interface RosterItem {
  jid: string;
  name?: string;
  subscription: 'both' | 'to' | 'from' | 'none' | 'remove';
  groups: string[];
  presence: UserPresence;
  statusText?: string;
}

interface XmppContextType {
  client: XmppClient | null;
  status: XmppStatus;
  jid: string | null;
  userId: string | null;
  error: string | null;
  roster: RosterItem[];
  chats: Chat[];
  connect: (jid: string, password: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (to: string, body: string, type?: 'text' | 'image' | 'document', fileName?: string) => void;
  markChatAsRead: (chatId: string) => void;
  getChatById: (chatId: string) => Chat | undefined;
  sendPresence: (show: 'chat' | 'away' | 'dnd' | 'xa' | undefined, statusText?: string) => void;
  sendUnavailablePresence: () => void;
}

const XmppContext = createContext<XmppContextType | undefined>(undefined);

export const XmppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [xmppClient, setXmppClient] = useState<XmppClient | null>(null);
  const [status, setStatus] = useState<XmppStatus>('disconnected');
  const [jid, setJid] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isWindowFocused, setIsWindowFocused] = useState(true);

  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const handleStanza = useCallback((stanza: Stanza) => {
    // Handle Presence
    if (stanza.is('presence')) {
      const from = stanza.getAttr('from').split('/')[0];
      const type = stanza.getAttr('type');
      const show = stanza.getChildText('show');
      const statusText = stanza.getChildText('status');

      setRoster(prevRoster =>
        prevRoster.map(contact => {
          if (contact.jid === from) {
            let newPresence: UserPresence;
            if (type === 'unavailable') {
              newPresence = 'unavailable';
            } else {
              newPresence = (show as UserPresence) || 'chat';
            }
            return { ...contact, presence: newPresence, statusText: statusText || '' };
          }
          return contact;
        })
      );
      return;
    }
    
    // Handle Messages
    if (stanza.is('message') && stanza.getChild('body')) {
      const fromJid = stanza.getAttr('from');
      const bareFromJid = fromJid.split('/')[0];
      const body = stanza.getChildText('body');
      const type = (stanza.getChildText('type') as Message['type']) || 'text';
      const fileName = stanza.getChildText('fileName');
      
      const isChatActive = bareFromJid === activeChatId && isWindowFocused;

      // Browser Notification Logic
      if (!isChatActive && Notification.permission === 'granted') {
          const contact = roster.find(r => r.jid === bareFromJid);
          const title = contact?.name || bareFromJid;
          const notification = new Notification(title, {
              body: type === 'text' ? body : 'Enviou uma mídia...',
              icon: '/icon.png', // A placeholder icon
              tag: bareFromJid, // Groups notifications by chat
          });
          notification.onclick = () => {
              window.focus();
          };
      }


      if (stanza.getAttr('type') === 'chat' && userId) {
        const newMessage: Omit<Message, 'id'> = {
          chatId: bareFromJid,
          senderId: bareFromJid,
          content: body,
          timestamp: serverTimestamp(),
          read: isChatActive,
          reactions: {},
          type,
          fileName,
        };

        // Save received message to Firestore
        addMessage(userId, newMessage);

        setChats(prevChats => {
          const chatIndex = prevChats.findIndex(c => c.id === bareFromJid);
          let newChats = [...prevChats];
          const fullMessage = { ...newMessage, id: stanza.getAttr('id') || `msg${Date.now()}` }

          if (chatIndex > -1) {
            const updatedChat = { ...newChats[chatIndex] };
            updatedChat.messages = [...updatedChat.messages, fullMessage];
            if (!isChatActive) {
                updatedChat.unreadCount = (updatedChat.unreadCount || 0) + 1;
            }
            newChats[chatIndex] = updatedChat;
          } else {
            const contact = roster.find(r => r.jid === bareFromJid);
            const newChat: Chat = {
              id: bareFromJid,
              type: 'individual',
              name: contact?.name || bareFromJid,
              avatar: `https://placehold.co/100x100.png`,
              participants: [{ userId: bareFromJid, role: 'member' }],
              messages: [fullMessage],
              unreadCount: 1,
            };
            newChats.push(newChat);
          }
          return newChats.sort((a,b) => (b.lastUpdated?.toMillis() || 0) - (a.lastUpdated?.toMillis() || 0));
        });
      }
    }
  }, [activeChatId, isWindowFocused, roster, userId]);


  const connect = useCallback(async (jidStr: string, passwordStr: string) => {
    if (xmppClient) {
      await xmppClient.stop().catch(console.error);
    }
    
    setStatus('connecting');
    setError(null);
    setRoster([]);
    setChats([]);

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
        setChats([]);
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

      newClient.on('stanza', handleStanza);

      newClient.on('online', async (address) => {
        console.log('Online as', address.toString());
        await newClient.send(xml('presence'));
        
        // Request notification permission
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'default') {
            await Notification.requestPermission();
          }
        }
        
        const rosterStanza = await newClient.iqCaller.request(
          xml('iq', { type: 'get' }, xml('query', { xmlns: 'jabber:iq:roster' }))
        );
        
        const items = rosterStanza.getChild('query')?.getChildren('item').map(item => ({
          jid: item.getAttr('jid'),
          name: item.getAttr('name'),
          subscription: item.getAttr('subscription'),
          groups: item.getChildren('group').map(g => g.getText()),
          presence: 'unavailable', // Default presence
        })) || [];
        setRoster(items as RosterItem[]);
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('xmpp_jid', jidStr);
          sessionStorage.setItem('xmpp_password', passwordStr);
        }
        const bareJid = address.bare().toString();
        Cookies.set('auth-jid', address.toString(), { expires: 1 });
        Cookies.set('auth-userId', bareJid, { expires: 1 });
        
        setJid(address.toString());
        setUserId(bareJid);
        setStatus('online');
        
        // Load chat history from Firestore
        const chatHistory = await getChats(bareJid);
        setChats(chatHistory);
      });

      setXmppClient(newClient);
      await newClient.start();

    } catch (e: any) {
      console.error(e);
      setStatus('error');
      setError(e.message || 'Ocorreu um erro inesperado durante a conexão.');
    }
  }, [xmppClient, handleStanza]);

  const disconnect = useCallback(async () => {
    if (xmppClient) {
      try {
        await xmppClient.send(xml('presence', { type: 'unavailable' }));
        await xmppClient.stop();
      } catch (e) {
        console.error('Error during disconnect:', e);
      }
    }
  }, [xmppClient]);

  const sendMessage = useCallback((to: string, body: string, type: Message['type'] = 'text', fileName?: string) => {
    if (!xmppClient || !userId) return;

    const messageStanza = xml('message', { to, type: 'chat', id: `msg${Date.now()}` }, 
        xml('body', {}, body),
    );
    if(type !== 'text') {
        messageStanza.getChild('body')?.append(xml('type', {}, type));
        if (fileName) {
            messageStanza.getChild('body')?.append(xml('fileName', {}, fileName));
        }
    }

    xmppClient.send(messageStanza);

    const sentMessageData: Omit<Message, 'id'> = {
      chatId: to,
      senderId: userId,
      content: body,
      timestamp: serverTimestamp(),
      read: true,
      reactions: {},
      type,
      fileName,
    };
    
    // Add message to Firestore
    addMessage(userId, sentMessageData);
    
    const sentMessage = { ...sentMessageData, id: messageStanza.getAttr('id') };

    setChats(prevChats => {
      const chatIndex = prevChats.findIndex(c => c.id === to);
      let newChats = [...prevChats];

      if (chatIndex > -1) {
        const updatedChat = { ...newChats[chatIndex] };
        updatedChat.messages = [...updatedChat.messages, sentMessage];
        newChats[chatIndex] = updatedChat;
      } else {
        const contact = roster.find(r => r.jid === to);
        const newChat: Chat = {
          id: to,
          type: 'individual',
          name: contact?.name || to,
          avatar: `https://placehold.co/100x100.png`,
          participants: [{ userId: to, role: 'member' }],
          messages: [sentMessage],
          unreadCount: 0,
        };
        newChats.push(newChat);
      }
      return newChats.sort((a,b) => (b.lastUpdated?.toMillis() || 0) - (a.lastUpdated?.toMillis() || 0));
    });
  }, [xmppClient, userId, roster]);

  const markChatAsRead = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  }, []);

  const getChatById = useCallback((chatId: string) => {
    return chats.find(c => c.id === chatId);
  }, [chats]);
  
  const sendPresence = useCallback(async (show: 'chat' | 'away' | 'dnd' | 'xa' | undefined, statusText?: string) => {
    if (!xmppClient) return;
    const presence = xml('presence');
    if (show && show !== 'chat') { // 'chat' is the default, so it's not needed
      presence.c('show', {}, show);
    }
    if (statusText) {
      presence.c('status', {}, statusText);
    }
    await xmppClient.send(presence);
  }, [xmppClient]);
  
  const sendUnavailablePresence = useCallback(async () => {
    if (xmppClient) {
      await xmppClient.send(xml('presence', { type: 'unavailable' }));
    }
  }, [xmppClient]);


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
  }, []); 

  return (
    <XmppContext.Provider value={{ client: xmppClient, status, jid, userId, error, connect, disconnect, roster, chats, sendMessage, markChatAsRead, getChatById, sendPresence, sendUnavailablePresence }}>
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
