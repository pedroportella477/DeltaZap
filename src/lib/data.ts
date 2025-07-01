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
      { id: "msg2", chatId: "chat1", senderId: "user1", content: "Tudo bem, apenas trabalhando em um novo projeto. E você?", timestamp: new Date(now.getTime() - 9 * 60000).toISOString(), read: true, reactions: {}, type: 'text' },
      { id: "msg3", chatId: "chat1", senderId: "user2", content: "Legal! Estou planejando uma viagem para o próximo mês.", timestamp: new Date(now.getTime() - 8 * 60000).toISOString(), read: true, reactions: { '❤️': 2 }, type: 'text' },
      { id: "msg4", chatId: "chat1", senderId: "user2", content: "Alguma sugestão?", timestamp: new Date(now.getTime() - 7 * 60000).toISOString(), read: false, reactions: {}, type: 'text' },
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
      { id: "msg6", chatId: "chat2", senderId: "user4", content: "Enviei as últimas atualizações para a branch de desenvolvimento.", timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60000 + 5 * 60000).toISOString(), read: true, reactions: { '🚀': 1 }, type: 'text' },
      { id: "msg7", chatId: "chat2", senderId: "user1", content: "Ótimo, vou revisar hoje à tarde.", timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60000 + 10 * 60000).toISOString(), read: true, reactions: {}, type: 'text' },
      { id: "msg8", chatId: "chat2", senderId: "user3", content: "Perfeito. Me avise se houver algum problema.", timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), read: false, reactions: {}, type: 'text' },
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

export function updateUserPresence(userId: string, presence: UserPresence) {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        users[userIndex].presence = presence;
    }
}
