
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
  serverTimestamp,
  getDoc,
  setDoc,
  limit
} from 'firebase/firestore';

// Core XMPP presence states
export type UserPresence = 'chat' | 'away' | 'dnd' | 'xa' | 'unavailable';

export type User = {
  id: string;
  name: string;
  avatar: string;
  status: string;
  // This represents the user's friendly presence status for the UI
  presence: 'online' | 'ocupado' | 'cafe' | 'almoco' | 'offline';
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
  timestamp: any; // Firestore Timestamp
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
  id:string;
  type: "individual"; // Removed "group" as it's not implemented
  name?: string;
  avatar?: string;
  participants: Participant[];
  messages: Message[];
  unreadCount?: number;
  lastUpdated?: any;
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
  timestamp: any;
};

export type InternalLink = {
  id: string;
  title: string;
  url: string;
  timestamp: any;
};

export const users: User[] = [
  { id: "user1", name: "Você", avatar: "https://placehold.co/100x100.png", status: "Codificando algo legal! ✨", presence: "online" },
  { id: "user2", name: "Larissa Mendes", avatar: "https://placehold.co/100x100.png", status: "De férias!", presence: "offline" },
  { id: "user3", name: "Pedro Portella", avatar: "https://placehold.co/100x100.png", status: "Ocupado com o trabalho.", presence: "ocupado" },
  { id: "user4", name: "Tamiris Mendes", avatar: "https://placehold.co/100x100.png", status: "Na academia.", presence: "online" },
];

const now = new Date();

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

const MAX_NOTES = 200;

// --- Chat History Firestore Functions ---
export async function getChats(userId: string): Promise<Chat[]> {
  const chatsCol = collection(db, 'users', userId, 'chats');
  const q = query(chatsCol, orderBy('lastUpdated', 'desc'));
  const querySnapshot = await getDocs(q);

  const chats = await Promise.all(querySnapshot.docs.map(async (doc) => {
    const chatData = doc.data() as Omit<Chat, 'id' | 'messages'>;
    const messagesCol = collection(db, 'users', userId, 'chats', doc.id, 'messages');
    // Load last 50 messages for performance. Could be paginated later.
    const messagesQuery = query(messagesCol, orderBy('timestamp', 'desc'), limit(50));
    const messagesSnapshot = await getDocs(messagesQuery);
    const messages = messagesSnapshot.docs.map(msgDoc => ({ id: msgDoc.id, ...msgDoc.data() } as Message)).reverse();
    
    return {
      id: doc.id,
      ...chatData,
      messages,
    } as Chat;
  }));

  return chats;
}

export async function addMessage(userId: string, message: Omit<Message, 'id'>) {
    const { chatId } = message;
    
    // Path to the chat document for this user
    const chatRef = doc(db, 'users', userId, 'chats', chatId);

    // Path to the messages subcollection for this chat
    const messagesCol = collection(chatRef, 'messages');

    // Add the message to the subcollection
    await addDoc(messagesCol, message);

    // Update the `lastUpdated` timestamp on the chat document
    // This also creates the chat document if it doesn't exist
    await setDoc(chatRef, { 
        id: chatId, 
        lastUpdated: message.timestamp 
    }, { merge: true });
}

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
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() } as Note;
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

// Mock function for adding a reaction, since this is not implemented in the XMPP context yet
export function addReaction(chatId: string, messageId: string, emoji: string) {
  console.log(`Reacted with ${emoji} to message ${messageId} in chat ${chatId}`);
}


// --- Firestore Functions for Admin Panel ---

// Support Materials
export async function getSupportMaterials(): Promise<SupportMaterial[]> {
  const materialsCol = collection(db, 'supportMaterials');
  const q = query(materialsCol, orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportMaterial));
}

export async function addSupportMaterial(data: Omit<SupportMaterial, 'id' | 'timestamp'>): Promise<SupportMaterial> {
  const newMaterialData = {
    ...data,
    timestamp: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'supportMaterials'), newMaterialData);
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() } as SupportMaterial;
}

export async function deleteSupportMaterial(id: string): Promise<void> {
  await deleteDoc(doc(db, 'supportMaterials', id));
}

// Internal Links
export async function getInternalLinks(): Promise<InternalLink[]> {
  const linksCol = collection(db, 'internalLinks');
  const q = query(linksCol, orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InternalLink));
}

export async function addInternalLink(title: string, url: string): Promise<InternalLink> {
  const newLinkData = {
    title,
    url,
    timestamp: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'internalLinks'), newLinkData);
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() } as InternalLink;
}

export async function updateInternalLink(id: string, title: string, url: string): Promise<void> {
  const linkRef = doc(db, 'internalLinks', id);
  await updateDoc(linkRef, { title, url });
}

export async function deleteInternalLink(id: string): Promise<void> {
  await deleteDoc(doc(db, 'internalLinks', id));
}
