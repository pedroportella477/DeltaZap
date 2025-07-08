
import { pool } from './postgres';

// --- Type Definitions ---
export type UserPresence = 'chat' | 'away' | 'dnd' | 'xa' | 'unavailable';

export type User = {
  id: string; name: string; avatar: string; status: string;
  presence: 'online' | 'ocupado' | 'cafe' | 'almoco' | 'offline';
};

export type Participant = { userId: string; role: 'admin' | 'member'; };

export type Message = {
  id: string; chatId: string; senderId: string; content: string;
  timestamp: Date; read: boolean; reactions: { [emoji: string]: number };
  type: 'text' | 'image' | 'document'; fileName?: string;
  replyTo?: { messageId: string; content: string; senderName: string; };
  forwarded?: boolean;
  sender?: { name: string, id: string, avatar: string };
};

export type Chat = {
  id:string; type: "individual" | "group"; name?: string; avatar?: string;
  participants: Participant[]; messages: Message[];
  unreadCount?: number; lastUpdated?: Date;
};

export type Status = { id: string; userId: string; content: string; timestamp: Date; type: 'text' | 'image'; };
export type Note = { id:string; userId: string; title: string; content: string; color: string; timestamp: Date; };
export type Appointment = { id: string; userId: string; date: string; title: string; timestamp: Date; };
export type SharedLink = { id: string; url: string; messageContent: string; sender: User; chat: { id: string; name: string; avatar?: string }; timestamp: string; };
export type SupportMaterial = { id: string; title: string; content: string; imageUrl?: string; documentUrl?: string; documentName?: string; timestamp: Date; };
export type InternalLink = { id: string; title: string; url: string; timestamp: Date; };
export type DemandPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';
export type DemandStatus = 'Pendente' | 'Em andamento' | 'Concluída' | 'Cancelada';
export type Demand = {
  id: string; title: string; description: string; creatorId: string; creatorName: string; assigneeId: string;
  assigneeName: string; priority: DemandPriority; dueDate: Date; status: DemandStatus; createdAt: Date; updatedAt: Date;
};

const noteColors = [
  'bg-yellow-200/50 dark:bg-yellow-800/30 border-yellow-400/50', 'bg-blue-200/50 dark:bg-blue-800/30 border-blue-400/50',
  'bg-green-200/50 dark:bg-green-800/30 border-green-400/50', 'bg-pink-200/50 dark:bg-pink-800/30 border-pink-400/50',
  'bg-purple-200/50 dark:bg-purple-800/30 border-purple-400/50',
];
const MAX_NOTES = 200;

// --- Helper Functions ---
const mapToNote = (row: any): Note => ({ id: row.note_id, userId: row.user_id, title: row.title, content: row.content, color: row.color, timestamp: new Date(row.timestamp) });
const mapToAppointment = (row: any): Appointment => ({ id: row.appointment_id, userId: row.user_id, date: new Date(row.date).toISOString().split('T')[0], title: row.title, timestamp: new Date(row.timestamp) });
const mapToSupportMaterial = (row: any): SupportMaterial => ({ id: row.material_id, title: row.title, content: row.content, imageUrl: row.image_url, documentUrl: row.document_url, documentName: row.document_name, timestamp: new Date(row.timestamp) });
const mapToInternalLink = (row: any): InternalLink => ({ id: row.link_id, title: row.title, url: row.url, timestamp: new Date(row.timestamp) });
const mapToDemand = (row: any): Demand => ({
    id: row.demand_id, title: row.title, description: row.description, creatorId: row.creator_id, creatorName: row.creator_name,
    assigneeId: row.assignee_id, assigneeName: row.assignee_name, priority: row.priority, dueDate: new Date(row.due_date),
    status: row.status, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at),
});
const mapToStatus = (row: any): Status => ({ id: row.status_id, userId: row.user_id, content: row.content, timestamp: new Date(row.timestamp), type: row.type });

// --- Chat History Functions ---
export async function getChats(userId: string): Promise<Chat[]> {
  const res = await pool.query('SELECT * FROM user_chats WHERE owner_id = $1 ORDER BY last_updated DESC', [userId]);
  const chats = await Promise.all(res.rows.map(async (chatRow) => {
    const messagesRes = await pool.query('SELECT * FROM user_messages WHERE owner_id = $1 AND chat_id = $2 ORDER BY timestamp DESC LIMIT 50', [userId, chatRow.chat_id]);
    const messages = messagesRes.rows.map(msgRow => ({
      id: msgRow.message_id.toString(), chatId: msgRow.chat_id, senderId: msgRow.sender_id, content: msgRow.content,
      timestamp: new Date(msgRow.timestamp), read: msgRow.read, reactions: msgRow.reactions || {}, type: msgRow.type,
      fileName: msgRow.file_name, replyTo: msgRow.reply_to, forwarded: msgRow.forwarded
    })).reverse();
    return {
      id: chatRow.chat_id, type: chatRow.type, name: chatRow.name, avatar: chatRow.avatar,
      participants: [], messages, unreadCount: chatRow.unread_count, lastUpdated: new Date(chatRow.last_updated)
    } as Chat;
  }));
  return chats;
}

export async function addMessage(userId: string, message: Omit<Message, 'id' | 'timestamp'> & { timestamp: Date }) {
    const { chatId, senderId, content, read, reactions, type, fileName, replyTo, forwarded } = message;
    
    // Add message for the user
    await pool.query(
      'INSERT INTO user_messages (owner_id, chat_id, sender_id, content, timestamp, read, reactions, type, file_name, reply_to, forwarded) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [userId, chatId, senderId, content, message.timestamp, read, reactions, type, fileName, replyTo, forwarded]
    );

    // Create or update the chat entry
    const chatType = message.chatId.includes('@conference.') ? 'group' : 'individual';
    const chatName = message.chatId.split('@')[0];
    await pool.query(
      `INSERT INTO user_chats (owner_id, chat_id, type, name, last_updated) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (owner_id, chat_id) DO UPDATE SET last_updated = EXCLUDED.last_updated`,
      [userId, chatId, chatType, chatName, message.timestamp]
    );
}

// --- Notes Functions ---
export async function getNotes(userId: string): Promise<Note[]> {
  const res = await pool.query('SELECT * FROM notes WHERE user_id = $1 ORDER BY timestamp DESC', [userId]);
  return res.rows.map(mapToNote);
}
export async function addNote(userId: string, title: string, content: string): Promise<Note> {
  const countRes = await pool.query('SELECT COUNT(*) FROM notes WHERE user_id = $1', [userId]);
  if (parseInt(countRes.rows[0].count, 10) >= MAX_NOTES) throw new Error(`Não é possível adicionar mais de ${MAX_NOTES} notas.`);
  const color = noteColors[Math.floor(Math.random() * noteColors.length)];
  const res = await pool.query('INSERT INTO notes(user_id, title, content, color) VALUES($1, $2, $3, $4) RETURNING *', [userId, title, content, color]);
  return mapToNote(res.rows[0]);
}
export async function updateNote(noteId: string, title: string, content: string): Promise<void> {
  await pool.query('UPDATE notes SET title = $1, content = $2, timestamp = NOW() WHERE note_id = $3', [title, content, noteId]);
}
export async function deleteNote(noteId: string): Promise<void> {
  await pool.query('DELETE FROM notes WHERE note_id = $1', [noteId]);
}

// --- Status Functions ---
export async function addStatus(userId: string, content: string, type: 'text' | 'image'): Promise<Status> {
  const res = await pool.query('INSERT INTO statuses(user_id, content, type) VALUES($1, $2, $3) RETURNING *', [userId, content, type]);
  return mapToStatus(res.rows[0]);
}
export async function getStatusesForRoster(userIds: string[]): Promise<Status[]> {
    if (userIds.length === 0) return [];
    // Using a Common Table Expression (CTE) to get the latest status per user in the last 24 hours
    const query = `
      WITH latest_statuses AS (
        SELECT *, ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY timestamp DESC) as rn
        FROM statuses
        WHERE user_id = ANY($1::text[]) AND timestamp >= NOW() - INTERVAL '24 hours'
      )
      SELECT * FROM latest_statuses WHERE rn = 1 ORDER BY timestamp DESC;
    `;
    const res = await pool.query(query, [userIds]);
    return res.rows.map(mapToStatus);
}

// --- Appointments Functions ---
export async function getAppointments(userId: string): Promise<Appointment[]> {
  const res = await pool.query('SELECT * FROM appointments WHERE user_id = $1 ORDER BY date ASC', [userId]);
  return res.rows.map(mapToAppointment);
}
export async function addAppointment(userId: string, date: string, title: string): Promise<Appointment> {
  const res = await pool.query('INSERT INTO appointments(user_id, date, title) VALUES($1, $2, $3) RETURNING *', [userId, date, title]);
  return mapToAppointment(res.rows[0]);
}
export async function deleteAppointment(appointmentId: string): Promise<void> {
  await pool.query('DELETE FROM appointments WHERE appointment_id = $1', [appointmentId]);
}

// --- Admin Panel Functions ---
export async function getSupportMaterials(): Promise<SupportMaterial[]> {
  const res = await pool.query('SELECT * FROM support_materials ORDER BY timestamp DESC');
  return res.rows.map(mapToSupportMaterial);
}
export async function addSupportMaterial(data: Omit<SupportMaterial, 'id' | 'timestamp'>): Promise<SupportMaterial> {
  const res = await pool.query(
    'INSERT INTO support_materials(title, content, image_url, document_url, document_name) VALUES($1, $2, $3, $4, $5) RETURNING *',
    [data.title, data.content, data.imageUrl, data.documentUrl, data.documentName]
  );
  return mapToSupportMaterial(res.rows[0]);
}
export async function deleteSupportMaterial(id: string): Promise<void> {
  await pool.query('DELETE FROM support_materials WHERE material_id = $1', [id]);
}

export async function getInternalLinks(): Promise<InternalLink[]> {
  const res = await pool.query('SELECT * FROM internal_links ORDER BY timestamp DESC');
  return res.rows.map(mapToInternalLink);
}
export async function addInternalLink(title: string, url: string): Promise<InternalLink> {
  const res = await pool.query('INSERT INTO internal_links(title, url) VALUES($1, $2) RETURNING *', [title, url]);
  return mapToInternalLink(res.rows[0]);
}
export async function updateInternalLink(id: string, title: string, url: string): Promise<void> {
  await pool.query('UPDATE internal_links SET title = $1, url = $2 WHERE link_id = $3', [title, url, id]);
}
export async function deleteInternalLink(id: string): Promise<void> {
  await pool.query('DELETE FROM internal_links WHERE link_id = $1', [id]);
}

// --- Demand/Task Management Functions ---
export async function addDemand(demandData: Omit<Demand, 'id' | 'createdAt' | 'updatedAt'>): Promise<Demand> {
  const res = await pool.query(
    `INSERT INTO demands(title, description, creator_id, creator_name, assignee_id, assignee_name, priority, due_date, status, created_at, updated_at) 
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, 'Pendente', NOW(), NOW()) RETURNING *`,
    [demandData.title, demandData.description, demandData.creatorId, demandData.creatorName, demandData.assigneeId, demandData.assigneeName, demandData.priority, demandData.dueDate]
  );
  return mapToDemand(res.rows[0]);
}
export async function getDemandsForUser(userId: string): Promise<{ assignedToMe: Demand[], createdByMe: Demand[] }> {
    const assignedQuery = pool.query("SELECT * FROM demands WHERE assignee_id = $1 ORDER BY created_at DESC", [userId]);
    const createdQuery = pool.query("SELECT * FROM demands WHERE creator_id = $1 ORDER BY created_at DESC", [userId]);
    const [assignedRes, createdQuery] = await Promise.all([assignedQuery, createdQuery]);
    return {
        assignedToMe: assignedRes.rows.map(mapToDemand),
        createdByMe: createdQuery.rows.map(mapToDemand),
    };
}
export async function updateDemand(demandId: string, data: Partial<Omit<Demand, 'id'>>): Promise<void> {
  const fields = Object.keys(data).map((key, i) => `"${key}" = $${i + 1}`).join(', ');
  const values = Object.values(data);
  await pool.query(`UPDATE demands SET ${fields}, updated_at = NOW() WHERE demand_id = $${values.length + 1}`, [...values, demandId]);
}

// Mock function for adding a reaction
export async function addReaction(chatId: string, messageId: string, emoji: string) {
  // This is a more complex feature, for now we log it.
  // In a real app, this would update the `reactions` JSONB column for the specific message.
  console.log(`Reacted with ${emoji} to message ${messageId} in chat ${chatId}`);
}
