
import { db } from './firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

export type UserPresence = 'online' | 'ocupado' | 'cafe' | 'almoco' | 'offline';

export type User = {
  id: string;
  name: string;
  avatar: string;
  status: string;
  presence: UserPresence;
};

export type Participant = {
  userId: string;
  role: 'admin' | 'member';
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  reactions: { [emoji: string]: number };
  type: 'text' | 'image' | 'document';
  fileName?: string;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  forwarded?: boolean;
};

export type Chat = {
  id: string;
  type: "individual" | "group";
  name?: string;
  avatar?: string;
  participants: Participant[];
  messages: Message[];
};

export type Status = {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
};

export type Note = {
  id:string;
  userId: string;
  title: string;
  content: string;
  color: string;
  timestamp: any; // Firestore Timestamp
};

export type SharedLink = {
  id: string;
  url: string;
  messageContent: string;
  sender: User;
  chat: { id: string; name: string; avatar?: string };
  timestamp: string;
};

export type SupportMaterial = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  documentUrl?: string;
  documentName?: string;
  timestamp: string;
};

export type InternalLink = {
  id: string;
  title: string;
  url: string;
  timestamp: string;
};

export const users: User[] = [
  { id: "user1", name: "Você", avatar: "https://placehold.co/100x100.png", status: "Codificando algo legal! ✨", presence: "online" },
  { id: "user2", name: "Larissa Mendes", avatar: "https://placehold.co/100x100.png", status: "De férias!", presence: "offline" },
  { id: "user3", name: "Pedro Portella", avatar: "https://placehold.co/100x100.png", status: "Ocupado com o trabalho.", presence: "ocupado" },
  { id: "user4", name: "Tamiris Mendes", avatar: "https://placehold.co/100x100.png", status: "Na academia.", presence: "online" },
  { id: "user5", name: "Equipe de Design", avatar: "https://placehold.co/100x100.png", status: "", presence: "cafe" },
];

const now = new Date();

export let chats: Chat[] = [
  {
    id: "chat1",
    type: "individual",
    participants: [{ userId: "user1", role: 'member' }, { userId: "user2", role: 'member' }],
    messages: [
      { id: "msg1", chatId: "chat1", senderId: "user2", content: "Olá! Como vai?", timestamp: new Date(now.getTime() - 10 * 60000).toISOString(), read: true, reactions: { '👍': 1 }, type: 'text' },
      { id: "msg2", chatId: "chat1", senderId: "user1", content: "Tudo bem, apenas trabalhando em um novo projeto. E você?", timestamp: new Date(now.getTime() - 9 * 60000).toISOString(), read: true, reactions: {}, type: 'text', replyTo: { messageId: "msg1", content: "Olá! Como vai?", senderName: "Larissa Mendes"} },
      { id: "msg3", chatId: "chat1", senderId: "user2", content: "Legal! Estou planejando uma viagem para o próximo mês.", timestamp: new Date(now.getTime() - 8 * 60000).toISOString(), read: true, reactions: { '❤️': 2 }, type: 'text' },
      { id: "msg4", chatId: "chat1", senderId: "user2", content: "Alguma sugestão?", timestamp: new Date(now.getTime() - 7 * 60000).toISOString(), read: false, reactions: {}, type: 'text' },
      { id: "msg_link_1", chatId: "chat1", senderId: "user1", content: "Falando em projeto, encontrei uma biblioteca de UI incrível: https://ui.shadcn.com/", timestamp: new Date(now.getTime() - 6 * 60000).toISOString(), read: true, reactions: {}, type: 'text' },
    ],
  },
  {
    id: "chat2",
    type: "group",
    name: "Projeto Delta",
    avatar: "https://placehold.co/100x100.png",
    participants: [
      { userId: "user1", role: 'admin' }, 
      { userId: "user3", role: 'member' },
      { userId: "user4", role: 'member' }
    ],
    messages: [
      { id: "msg5", chatId: "chat2", senderId: "user3", content: "Olá equipe, qual é o status da nova funcionalidade?", timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60000).toISOString(), read: true, reactions: {}, type: 'text' },
      { id: "msg6", chatId: "chat2", senderId: "user4", content: "Enviei as últimas atualizações para a branch de desenvolvimento.", timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60000 + 5 * 60000).toISOString(), read: true, reactions: {}, type: 'text' },
      { id: "msg7", chatId: "chat2", senderId: "user1", content: "Ótimo, vou revisar hoje à tarde.", timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60000 + 10 * 60000).toISOString(), read: true, reactions: {}, type: 'text' },
      { id: "msg_link_2", chatId: "chat2", senderId: "user3", content: "Perfeito. Quem precisar de acesso ao Figma, o link é este: https://www.figma.com/files", timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), read: false, reactions: {}, type: 'text' },
    ],
  },
  {
    id: "chat3",
    type: "individual",
    participants: [{ userId: "user1", role: 'member' }, { userId: "user4", role: 'member' }],
    messages: [
      { id: "msg9", chatId: "chat3", senderId: "user4", content: "A sessão de academia hoje foi intensa!", timestamp: new Date(now.getTime() - 3 * 60 * 60000).toISOString(), read: true, reactions: {}, type: 'text' },
      { id: "msg10", chatId: "chat3", senderId: "user1", content: "Haha, imagino! Estou planejando ir amanhã.", timestamp: new Date(now.getTime() - 2 * 60 * 60000).toISOString(), read: false, reactions: {}, type: 'text' },
    ],
  },
];

export const statuses: Status[] = [
    { id: 'status1', userId: 'user2', content: 'Aproveitando a vida na praia! 🏖️', timestamp: new Date(now.getTime() - 2 * 60 * 60000).toISOString(), type: 'text' },
    { id: 'status2', userId: 'user3', content: 'https://placehold.co/300x500.png', timestamp: new Date(now.getTime() - 5 * 60 * 60000).toISOString(), type: 'image' },
    { id: 'status3', userId: 'user4', content: 'Novo recorde pessoal! #fitness', timestamp: new Date(now.getTime() - 8 * 60 * 60000).toISOString(), type: 'text' },
];

const noteColors = [
  'bg-yellow-200/50 dark:bg-yellow-800/30 border-yellow-400/50',
  'bg-blue-200/50 dark:bg-blue-800/30 border-blue-400/50',
  'bg-green-200/50 dark:bg-green-800/30 border-green-400/50',
  'bg-pink-200/50 dark:bg-pink-800/30 border-pink-400/50',
  'bg-purple-200/50 dark:bg-purple-800/30 border-purple-400/50',
];

export let supportMaterials: SupportMaterial[] = [
  {
    id: `support${Date.now()}`,
    title: 'Como conectar ao servidor XMPP',
    content: 'Certifique-se de que o servidor Openfire está em execução. Use seu JID completo (usuario@servidor) e senha para fazer login. O endereço do servidor websocket é configurado para ws://localhost:7070/ws-xmpp por padrão.',
    timestamp: new Date().toISOString(),
  }
];

export let internalLinks: InternalLink[] = [
    {
        id: `intlink1`,
        title: 'Portal de Colaboradores',
        url: 'https://intranet.empresa.com',
        timestamp: new Date().toISOString(),
    },
    {
        id: `intlink2`,
        title: 'Sistema de Ponto Eletrônico',
        url: 'https://ponto.empresa.com',
        timestamp: new Date().toISOString(),
    }
];

const MAX_NOTES = 200;

export async function getNotes(userId: string): Promise<Note[]> {
  if (!userId) return [];
  const notesCol = collection(db, 'notes');
  const q = query(notesCol, where('userId', '==', userId), orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
}

export async function addNote(userId: string, title: string, content: string): Promise<Note> {
  if (!userId) {
    throw new Error("Usuário não autenticado.");
  }

  const notesCollection = collection(db, 'notes');
  const userNotesQuery = query(notesCollection, where('userId', '==', userId));
  const userNotesSnapshot = await getDocs(userNotesQuery);
  if (userNotesSnapshot.size >= MAX_NOTES) {
    throw new Error(`Não é possível adicionar mais de ${MAX_NOTES} notas.`);
  }

  const newNoteData = {
    userId,
    title,
    content,
    color: noteColors[Math.floor(Math.random() * noteColors.length)],
    timestamp: serverTimestamp(),
  };
  const docRef = await addDoc(notesCollection, newNoteData);
  // Return a client-side representation
  return { id: docRef.id, ...newNoteData, timestamp: new Date() };
}

export async function updateNote(noteId: string, title: string, content: string): Promise<void> {
  const noteRef = doc(db, 'notes', noteId);
  await updateDoc(noteRef, {
    title,
    content,
    timestamp: serverTimestamp()
  });
}

export async function deleteNote(noteId: string): Promise<void> {
  await deleteDoc(doc(db, 'notes', noteId));
}

export function getChatData(chatId: string) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return null;

    const participantsWithDetails = chat.participants.map(p => {
        const user = users.find(u => u.id === p.userId)!;
        return { ...user, role: p.role };
    });

    const messagesWithSender = chat.messages.map(m => ({
        ...m,
        sender: users.find(u => u.id === m.senderId)!
    }));
    
    const otherParticipant = chat.type === 'individual' ? participantsWithDetails.find(p => p.id !== 'user1') : null;
    
    return {
        ...chat,
        name: chat.name || otherParticipant?.name,
        avatar: chat.avatar || otherParticipant?.avatar,
        participants: participantsWithDetails,
        messages: messagesWithSender
    };
}

export function createGroupChat(name: string, memberIds: string[]) {
    const newChat: Chat = {
        id: `chat${Date.now()}`,
        type: 'group',
        name,
        avatar: `https://placehold.co/100x100.png`,
        participants: [
            { userId: 'user1', role: 'admin' },
            ...memberIds.map(id => ({ userId: id, role: 'member' as const }))
        ],
        messages: [{
            id: `msg${Date.now()}`,
            chatId: `chat${Date.now()}`,
            senderId: 'user1',
            content: `Grupo "${name}" criado.`,
            timestamp: new Date().toISOString(),
            read: true,
            reactions: {},
            type: 'text',
        }]
    };
    chats.unshift(newChat);
    return newChat;
}


export function updateParticipantRole(chatId: string, userId: string, role: 'admin' | 'member') {
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) return;

    const participantIndex = chats[chatIndex].participants.findIndex(p => p.userId === userId);
    if (participantIndex === -1) return;

    chats[chatIndex].participants[participantIndex].role = role;
}

export function removeParticipant(chatId: string, userId: string) {
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) return;

    chats[chatIndex].participants = chats[chatIndex].participants.filter(p => p.userId !== userId);
}

export function getSharedLinks(): SharedLink[] {
  const allLinks: SharedLink[] = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  chats.forEach(chat => {
    let chatDetails;
    if (chat.type === 'group') {
        chatDetails = {
            id: chat.id,
            name: chat.name!,
            avatar: chat.avatar!,
        };
    } else {
        const otherUser = users.find(u => u.id === chat.participants.find(p => p.userId !== 'user1')?.userId);
        chatDetails = {
            id: chat.id,
            name: otherUser?.name || "Unknown Chat",
            avatar: otherUser?.avatar
        };
    }

    chat.messages.forEach(message => {
      if (message.type === 'text') {
        const foundUrls = message.content.match(urlRegex);
        if (foundUrls) {
          const sender = users.find(u => u.id === message.senderId);
          if (sender) {
            foundUrls.forEach(url => {
              allLinks.push({
                id: `${message.id}-${url}`,
                url: url,
                messageContent: message.content,
                sender: sender,
                chat: chatDetails,
                timestamp: message.timestamp,
              });
            });
          }
        }
      }
    });
  });

  return allLinks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function forwardMessage(message: Message, targetChatIds: string[]) {
  targetChatIds.forEach(chatId => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      const newMessage: Message = {
        ...message,
        id: `msg${Date.now()}-${chatId}-${Math.random()}`,
        chatId: chatId,
        senderId: 'user1',
        timestamp: new Date().toISOString(),
        read: false,
        reactions: {},
        replyTo: undefined,
        forwarded: true,
      };
      chat.messages.push(newMessage);
    }
  });
}

export function addReaction(chatId: string, messageId: string, emoji: string) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;

  const message = chat.messages.find(m => m.id === messageId);
  if (!message) return;

  if (!message.reactions) {
    message.reactions = {};
  }

  message.reactions[emoji] = (message.reactions[emoji] || 0) + 1;
}

export function deleteMessage(chatId: string, messageId: string) {
  const chatIndex = chats.findIndex(c => c.id === chatId);
  if (chatIndex > -1) {
    const messageIndex = chats[chatIndex].messages.findIndex(m => m.id === messageId);
    if (messageIndex > -1) {
      chats[chatIndex].messages.splice(messageIndex, 1);
      return true;
    }
  }
  return false;
}

export function getSupportMaterials() {
  return supportMaterials.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addSupportMaterial(data: Omit<SupportMaterial, 'id' | 'timestamp'>) {
  const newMaterial: SupportMaterial = {
    id: `support${Date.now()}`,
    ...data,
    timestamp: new Date().toISOString(),
  };
  supportMaterials.unshift(newMaterial);
  return newMaterial;
}

export function deleteSupportMaterial(id: string) {
  const index = supportMaterials.findIndex(m => m.id === id);
  if (index > -1) {
    supportMaterials.splice(index, 1);
    return true;
  }
  return false;
}

export function getInternalLinks(): InternalLink[] {
  return internalLinks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addInternalLink(title: string, url: string) {
  const newLink: InternalLink = {
    id: `intlink${Date.now()}`,
    title,
    url,
    timestamp: new Date().toISOString(),
  };
  internalLinks.unshift(newLink);
  return newLink;
}

export function updateInternalLink(id: string, title: string, url: string) {
    const index = internalLinks.findIndex(l => l.id === id);
    if (index > -1) {
        internalLinks[index] = { ...internalLinks[index], title, url };
        return internalLinks[index];
    }
    return null;
}

export function deleteInternalLink(id: string) {
    const index = internalLinks.findIndex(l => l.id === id);
    if (index > -1) {
        internalLinks.splice(index, 1);
        return true;
    }
    return false;
}
