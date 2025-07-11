
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { client, xml } from '@xmpp/client';
import type { XmppClient, Stanza } from '@xmpp/client';
import Cookies from 'js-cookie';
import { Chat, Message, User, UserPresence, addMessage, getChats } from '@/lib/data';


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
  subscriptionRequests: string[];
  chats: Chat[];
  connect: (jid: string, password: string) => Promise<void>;
  loginAsMaster: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (to: string, body: string, type?: 'text' | 'image' | 'document', fileName?: string) => void;
  markChatAsRead: (chatId: string) => void;
  getChatById: (chatId: string) => Chat | undefined;
  sendPresence: (show: 'chat' | 'away' | 'dnd' | 'xa' | undefined, statusText?: string) => void;
  sendUnavailablePresence: () => void;
  addContact: (jid: string) => void;
  acceptSubscription: (jid: string) => void;
  declineSubscription: (jid: string) => void;
}

const XmppContext = createContext<XmppContextType | undefined>(undefined);

export const XmppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [xmppClient, setXmppClient] = useState<XmppClient | null>(null);
  const [status, setStatus] = useState<XmppStatus>('disconnected');
  const [jid, setJid] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [subscriptionRequests, setSubscriptionRequests] = useState<string[]>([]);
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
    if (stanza.is('iq') && stanza.getAttr('type') === 'set') {
      const query = stanza.getChild('query', 'jabber:iq:roster');
      if (query) {
          const itemEl = query.getChild('item');
          if (itemEl) {
              const jid = itemEl.getAttr('jid');
              const subscription = itemEl.getAttr('subscription');
              
              if (subscription === 'remove') {
                  setRoster(prev => prev.filter(r => r.jid !== jid));
              } else {
                  const newRosterItem: RosterItem = {
                      jid: jid,
                      name: itemEl.getAttr('name'),
                      subscription: subscription as RosterItem['subscription'],
                      groups: itemEl.getChildren('group').map(g => g.getText()),
                      presence: 'unavailable',
                  };
                  setRoster(prev => {
                      const existingIndex = prev.findIndex(r => r.jid === jid);
                      if (existingIndex > -1) {
                          const updatedRoster = [...prev];
                          updatedRoster[existingIndex] = { ...updatedRoster[existingIndex], ...newRosterItem };
                          return updatedRoster;
                      } else {
                          return [...prev, newRosterItem];
                      }
                  });
              }
          }
      }
    }


    if (stanza.is('presence')) {
      const from = stanza.getAttr('from').split('/')[0];
      const type = stanza.getAttr('type');
      
      if (type === 'subscribe') {
        setSubscriptionRequests(prev => prev.includes(from) ? prev : [...prev, from]);
        return;
      }
      
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
    
    if (stanza.is('message') && stanza.getChild('body') && userId) {
      const typeAttr = stanza.getAttr('type');
      const fromJid = stanza.getAttr('from');
      const body = stanza.getChildText('body');
      const msgType = (stanza.getChildText('type') as Message['type']) || 'text';
      const fileName = stanza.getChildText('fileName');

      if (typeAttr === 'chat') {
        const bareFromJid = fromJid.split('/')[0];
        const isChatActive = bareFromJid === activeChatId && isWindowFocused;

        if (!isChatActive && Notification.permission === 'granted') {
            const contact = roster.find(r => r.jid === bareFromJid);
            const title = contact?.name || bareFromJid;
            new Notification(title, { body: msgType === 'text' ? body : 'Enviou uma mídia...', icon: '/icon.png', tag: bareFromJid });
        }

        const newMessage: Omit<Message, 'id'> & {timestamp: Date} = {
          chatId: bareFromJid,
          senderId: bareFromJid,
          content: body,
          timestamp: new Date(),
          read: isChatActive,
          reactions: {},
          type: msgType,
          fileName,
        };
        addMessage(userId, newMessage);

        setChats(prevChats => {
          const chatIndex = prevChats.findIndex(c => c.id === bareFromJid);
          let newChats = [...prevChats];
          const fullMessage = { ...newMessage, id: stanza.getAttr('id') || `msg${Date.now()}` }

          if (chatIndex > -1) {
            const updatedChat = { ...newChats[chatIndex] };
            updatedChat.messages = [...updatedChat.messages, fullMessage];
            if (!isChatActive) updatedChat.unreadCount = (updatedChat.unreadCount || 0) + 1;
            newChats[chatIndex] = updatedChat;
          } else {
            const contact = roster.find(r => r.jid === bareFromJid);
            newChats.push({
              id: bareFromJid, type: 'individual', name: contact?.name || bareFromJid,
              avatar: `https://placehold.co/100x100.png`,
              participants: [{ userId: bareFromJid, role: 'member' }],
              messages: [fullMessage], unreadCount: 1,
            });
          }
          return newChats.sort((a,b) => (b.lastUpdated?.getTime() || 0) - (a.lastUpdated?.getTime() || 0));
        });

      } else if (typeAttr === 'groupchat') {
        const roomJid = fromJid.split('/')[0];
        const senderNickname = fromJid.split('/')[1];

        if (!senderNickname) return;

        const isChatActive = roomJid === activeChatId && isWindowFocused;

        if (!isChatActive && Notification.permission === 'granted') {
            const chat = chats.find(c => c.id === roomJid);
            const title = chat?.name || roomJid;
            new Notification(title, { body: `${senderNickname}: ${msgType === 'text' ? body : 'Enviou uma mídia...'}`, icon: '/icon.png', tag: roomJid });
        }

        const newMessage: Omit<Message, 'id'> & {timestamp: Date} = {
          chatId: roomJid, senderId: senderNickname, content: body,
          timestamp: new Date(), read: isChatActive, reactions: {},
          type: msgType, fileName, sender: { name: senderNickname, id: senderNickname, avatar: '' }
        };
        addMessage(userId, newMessage);

        setChats(prevChats => {
          const chatIndex = prevChats.findIndex(c => c.id === roomJid);
          let newChats = [...prevChats];
          const fullMessage = { ...newMessage, id: stanza.getAttr('id') || `msg${Date.now()}` }

          if (chatIndex > -1) {
            const updatedChat = { ...newChats[chatIndex] };
            updatedChat.messages = [...updatedChat.messages, fullMessage];
            const myUsername = jid?.split('@')[0];
            if (!isChatActive && senderNickname !== myUsername) updatedChat.unreadCount = (updatedChat.unreadCount || 0) + 1;
            newChats[chatIndex] = updatedChat;
          } else {
            newChats.push({
              id: roomJid, type: 'group', name: roomJid.split('@')[0],
              avatar: `https://placehold.co/100x100.png`, participants: [],
              messages: [fullMessage], unreadCount: 1,
            });
          }
          return newChats.sort((a,b) => (b.lastUpdated?.getTime() || 0) - (a.lastUpdated?.getTime() || 0));
        });
      }
    }
  }, [activeChatId, isWindowFocused, roster, userId, jid, chats]);


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
      const service = `ws://${serverIp}:${serverPort}/ws/`;

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
        Cookies.remove('auth-jid', { path: '/' });
        Cookies.remove('auth-userId', { path: '/' });
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
          presence: 'unavailable',
        })) || [];
        setRoster(items as RosterItem[]);
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('xmpp_jid', jidStr);
          sessionStorage.setItem('xmpp_password', passwordStr);
        }
        const bareJid = address.bare().toString();
        Cookies.set('auth-jid', address.toString(), { expires: 1, path: '/' });
        Cookies.set('auth-userId', bareJid, { expires: 1, path: '/' });
        
        setJid(address.toString());
        setUserId(bareJid);
        setStatus('online');
        
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

  const loginAsMaster = useCallback(async () => {
    setError(null);
    try {
        const masterJid = 'master@deltazap.com';
        const chatHistory = await getChats(masterJid);
        
        setJid(masterJid);
        setUserId(masterJid);
        setRoster([]); 
        setChats(chatHistory);
        
        Cookies.set('auth-jid', masterJid, { expires: 1, path: '/' });
        Cookies.set('auth-userId', masterJid, { expires: 1, path: '/' });
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('xmpp_jid', masterJid);
            sessionStorage.setItem('xmpp_password', 'IS_MASTER_USER');
        }

        setStatus('online');
    } catch (e: any) {
        console.error("Master login failed:", e);
        setStatus('error');
        setError("Falha ao entrar como master. Verifique a conexão com o banco de dados.");
        
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('xmpp_jid');
            sessionStorage.removeItem('xmpp_password');
        }
        Cookies.remove('auth-jid', { path: '/' });
        Cookies.remove('auth-userId', { path: '/' });
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (xmppClient) {
      try {
        await xmppClient.send(xml('presence', { type: 'unavailable' }));
        await xmppClient.stop();
      } catch (e) {
        console.error('Error during disconnect:', e);
      }
    }
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('xmpp_jid');
        sessionStorage.removeItem('xmpp_password');
    }
    Cookies.remove('auth-jid', { path: '/' });
    Cookies.remove('auth-userId', { path: '/' });
  }, [xmppClient]);

  const sendMessage = useCallback((to: string, body: string, type: Message['type'] = 'text', fileName?: string) => {
    if (!xmppClient || !userId || jid === 'master@deltazap.com') {
      if (jid === 'master@deltazap.com') console.warn("Master user cannot send messages.");
      return;
    };
    
    const chat = chats.find(c => c.id === to);
    const messageType = chat?.type === 'group' ? 'groupchat' : 'chat';

    const messageStanza = xml('message', { to, type: messageType, id: `msg${Date.now()}` }, 
        xml('body', {}, body),
        xml('type', {}, type)
    );
    
    if (fileName) {
       messageStanza.c('fileName', {}, fileName);
    }
    
    xmppClient.send(messageStanza);

    if (messageType === 'chat') {
        const sentMessageData: Omit<Message, 'id'> & { timestamp: Date } = {
          chatId: to,
          senderId: userId,
          content: body,
          timestamp: new Date(),
          read: true,
          reactions: {},
          type,
          fileName,
          sender: {id: userId, name: 'Você', avatar: ''}
        };
        
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
          return newChats.sort((a,b) => (b.lastUpdated?.getTime() || 0) - (a.lastUpdated?.getTime() || 0));
        });
    }
  }, [xmppClient, userId, roster, jid, chats]);

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
    if (show && show !== 'chat') {
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

  const addContact = useCallback((jid: string) => {
    if (!xmppClient) return;
    xmppClient.send(xml('presence', { to: jid, type: 'subscribe' }));
  }, [xmppClient]);

  const acceptSubscription = useCallback((jid: string) => {
    if (!xmppClient) return;
    xmppClient.send(xml('presence', { to: jid, type: 'subscribed' }));
    xmppClient.send(xml('presence', { to: jid, type: 'subscribe' }));
    setSubscriptionRequests(prev => prev.filter(reqJid => reqJid !== jid));
  }, [xmppClient]);

  const declineSubscription = useCallback((jid: string) => {
    if (!xmppClient) return;
    xmppClient.send(xml('presence', { to: jid, type: 'unsubscribed' }));
    setSubscriptionRequests(prev => prev.filter(reqJid => reqJid !== jid));
  }, [xmppClient]);


  useEffect(() => {
    const savedJid = sessionStorage.getItem('xmpp_jid');
    const savedPassword = sessionStorage.getItem('xmpp_password');
    if (savedJid && savedPassword) {
      if (savedJid === 'master@deltazap.com' && savedPassword === 'IS_MASTER_USER') {
        setStatus('restoring');
        loginAsMaster();
      } else {
        setStatus('restoring');
        connect(savedJid, savedPassword);
      }
    } else {
      setStatus('disconnected');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <XmppContext.Provider value={{ client: xmppClient, status, jid, userId, error, connect, loginAsMaster, disconnect, roster, subscriptionRequests, chats, sendMessage, markChatAsRead, getChatById, sendPresence, sendUnavailablePresence, addContact, acceptSubscription, declineSubscription }}>
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
