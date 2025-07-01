export type User = {
  id: string;
  name: string;
  avatar: string;
  status: string;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  reactions: { [emoji: string]: number };
};

export type Chat = {
  id: string;
  type: "individual" | "group";
  name?: string;
  avatar?: string;
  participants: string[];
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
  { id: "user1", name: "You", avatar: "https://placehold.co/100x100.png", status: "Coding something cool! ✨" },
  { id: "user2", name: "Alice", avatar: "https://placehold.co/100x100.png", status: "On a vacation!" },
  { id: "user3", name: "Bob", avatar: "https://placehold.co/100x100.png", status: "Busy with work." },
  { id: "user4", name: "Charlie", avatar: "https://placehold.co/100x100.png", status: "At the gym." },
  { id: "user5", name: "Design Team", avatar: "https://placehold.co/100x100.png", status: "" },
];

const now = new Date();

export const chats: Chat[] = [
  {
    id: "chat1",
    type: "individual",
    participants: ["user1", "user2"],
    messages: [
      { id: "msg1", chatId: "chat1", senderId: "user2", content: "Hey! How's it going?", timestamp: new Date(now.getTime() - 10 * 60000).toISOString(), read: true, reactions: { '👍': 1 } },
      { id: "msg2", chatId: "chat1", senderId: "user1", content: "Pretty good, just working on a new project. You?", timestamp: new Date(now.getTime() - 9 * 60000).toISOString(), read: true, reactions: {} },
      { id: "msg3", chatId: "chat1", senderId: "user2", content: "Nice! I'm planning a trip for next month.", timestamp: new Date(now.getTime() - 8 * 60000).toISOString(), read: true, reactions: { '❤️': 2 } },
      { id: "msg4", chatId: "chat1", senderId: "user2", content: "Any suggestions?", timestamp: new Date(now.getTime() - 7 * 60000).toISOString(), read: false, reactions: {} },
    ],
  },
  {
    id: "chat2",
    type: "group",
    name: "Project Delta",
    avatar: "https://placehold.co/100x100.png",
    participants: ["user1", "user3", "user4"],
    messages: [
      { id: "msg5", chatId: "chat2", senderId: "user3", content: "Hey team, what's the status on the new feature?", timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60000).toISOString(), read: true, reactions: {} },
      { id: "msg6", chatId: "chat2", senderId: "user4", content: "I've pushed the latest updates to the dev branch.", timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60000 + 5 * 60000).toISOString(), read: true, reactions: { '🚀': 1 } },
      { id: "msg7", chatId: "chat2", senderId: "user1", content: "Great, I'll review it this afternoon.", timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60000 + 10 * 60000).toISOString(), read: true, reactions: {} },
      { id: "msg8", chatId: "chat2", senderId: "user3", content: "Perfect. Let me know if there are any issues.", timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), read: false, reactions: {} },
    ],
  },
  {
    id: "chat3",
    type: "individual",
    participants: ["user1", "user4"],
    messages: [
      { id: "msg9", chatId: "chat3", senderId: "user4", content: "Gym session was intense today!", timestamp: new Date(now.getTime() - 3 * 60 * 60000).toISOString(), read: true, reactions: {} },
      { id: "msg10", chatId: "chat3", senderId: "user1", content: "Haha, I bet! I'm planning to go tomorrow.", timestamp: new Date(now.getTime() - 2 * 60 * 60000).toISOString(), read: false, reactions: {} },
    ],
  },
];

export const statuses: Status[] = [
    { id: 'status1', userId: 'user2', content: 'Enjoying the beach life! 🏖️', timestamp: new Date(now.getTime() - 2 * 60 * 60000).toISOString(), type: 'text' },
    { id: 'status2', userId: 'user3', content: 'https://placehold.co/300x500.png', timestamp: new Date(now.getTime() - 5 * 60 * 60000).toISOString(), type: 'image' },
    { id: 'status3', userId: 'user4', content: 'New personal best! #fitness', timestamp: new Date(now.getTime() - 8 * 60 * 60000).toISOString(), type: 'text' },
];

export function getChatData(chatId: string) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return null;

    const participants = users.filter(u => chat.participants.includes(u.id));
    const messagesWithSender = chat.messages.map(m => ({
        ...m,
        sender: users.find(u => u.id === m.senderId)!
    }));

    const otherParticipant = chat.type === 'individual' ? participants.find(p => p.id !== 'user1') : null;
    
    return {
        ...chat,
        name: chat.name || otherParticipant?.name,
        avatar: chat.avatar || otherParticipant?.avatar,
        participants,
        messages: messagesWithSender
    };
}
