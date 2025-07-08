
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
  limit,
  Timestamp
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
  sender?: { name: string, id: string, avatar: string };
};

export type Chat = {
  id:string;
  type: "individual" | "group";
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
  timestamp: any; // Firestore Timestamp
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

export type Appointment = {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  title: string;
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

// --- Demandas (Tarefas/Tickets) ---
export type DemandPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';
export type DemandStatus = 'Pendente' | 'Em andamento' | 'Concluída' | 'Cancelada';

export type Demand = {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  assigneeId: string;
  assigneeName: string;
  priority: DemandPriority;
  dueDate: any; // Firestore Timestamp
  status: DemandStatus;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
};

export type DemandComment = {
  id: string;
  demandId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any; // Firestore Timestamp
};

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
    
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    const messagesCol = collection(chatRef, 'messages');

    await addDoc(messagesCol, message);

    await setDoc(chatRef, { 
        id: chatId,
        type: message.chatId.includes('@conference.') ? 'group' : 'individual',
        name: message.chatId.split('@')[0],
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

// Mock function for adding a reaction
export function addReaction(chatId: string, messageId: string, emoji: string) {
  // In a real app, this would update Firestore
  console.log(`Reacted with ${emoji} to message ${messageId} in chat ${chatId}`);
}

// --- Status Functions ---
export async function addStatus(userId: string, content: string, type: 'text' | 'image'): Promise<Status> {
  const newStatusData = {
    userId,
    content,
    type,
    timestamp: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'statuses'), newStatusData);
  const docSnap = await getDoc(docRef);
  
  return { 
      id: docSnap.id, 
      ...docSnap.data(),
  } as Status;
}

export async function getStatusesForRoster(userIds: string[]): Promise<Status[]> {
  if (userIds.length === 0) {
    return [];
  }
  
  const twentyFourHoursAgo = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);

  const statusPromises = userIds.map(uid => {
    const statusesCol = collection(db, 'statuses');
    const q = query(
      statusesCol, 
      where('userId', '==', uid),
      where('timestamp', '>=', twentyFourHoursAgo),
      orderBy('timestamp', 'desc'), 
      limit(1)
    );
    return getDocs(q);
  });

  const snapshots = await Promise.all(statusPromises);
  const allStatuses: Status[] = [];

  snapshots.forEach(snapshot => {
    snapshot.forEach(doc => {
      allStatuses.push({
        id: doc.id,
        ...doc.data(),
      } as Status);
    });
  });

  return allStatuses.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
}


// --- Appointments Functions ---
export async function getAppointments(userId: string): Promise<Appointment[]> {
  if (!userId) return [];
  const appointmentsCol = collection(db, 'appointments');
  const q = query(appointmentsCol, where('userId', '==', userId), orderBy('date', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
}

export async function addAppointment(userId: string, date: string, title: string): Promise<Appointment> {
  if (!userId) throw new Error("Usuário não autenticado.");
  
  const newAppointmentData = {
    userId,
    date, // YYYY-MM-DD
    title,
    timestamp: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'appointments'), newAppointmentData);
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() } as Appointment;
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
  await deleteDoc(doc(db, 'appointments', appointmentId));
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

// --- Demand/Task Management Functions ---
export async function addDemand(demandData: Omit<Demand, 'id' | 'createdAt' | 'updatedAt'>): Promise<Demand> {
  const dataWithTimestamps = {
    ...demandData,
    status: 'Pendente' as DemandStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'demands'), dataWithTimestamps);
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() } as Demand;
}

export async function getDemandsForUser(userId: string): Promise<{ assignedToMe: Demand[], createdByMe: Demand[] }> {
  if (!userId) return { assignedToMe: [], createdByMe: [] };
  const demandsCol = collection(db, 'demands');
  
  const assignedQuery = query(demandsCol, where('assigneeId', '==', userId), orderBy('createdAt', 'desc'));
  const createdQuery = query(demandsCol, where('creatorId', '==', userId), orderBy('createdAt', 'desc'));

  const [assignedSnapshot, createdSnapshot] = await Promise.all([
    getDocs(assignedQuery),
    getDocs(createdQuery)
  ]);

  const assignedToMe = assignedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Demand));
  const createdByMe = createdSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Demand));

  return { assignedToMe, createdByMe };
}

export async function updateDemand(demandId: string, data: Partial<Omit<Demand, 'id'>>): Promise<void> {
  const demandRef = doc(db, 'demands', demandId);
  await updateDoc(demandRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
