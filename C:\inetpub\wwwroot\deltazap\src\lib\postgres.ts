
import { Pool } from 'pg';
import 'dotenv/config';

// A conexão é feita usando a string de conexão da variável de ambiente POSTGRES_URL
// Formato: postgres://USUARIO:SENHA@HOST:PORTA/BANCO_DE_DADOS
export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

pool.on('error', (err, client) => {
  console.error('Erro inesperado no cliente de banco de dados ocioso', err);
  process.exit(-1);
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        note_id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        color TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        appointment_id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        date DATE NOT NULL,
        title TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_materials (
        material_id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        document_url TEXT,
        document_name TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS internal_links (
        link_id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS demands (
        demand_id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        creator_id TEXT NOT NULL,
        creator_name TEXT NOT NULL,
        assignee_id TEXT NOT NULL,
        assignee_name TEXT NOT NULL,
        priority TEXT NOT NULL,
        due_date DATE NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS statuses (
        status_id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        type TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_chats (
        owner_id TEXT NOT NULL,
        chat_id TEXT NOT NULL,
        type TEXT NOT NULL,
        name TEXT,
        avatar TEXT,
        last_updated TIMESTAMPTZ DEFAULT NOW(),
        unread_count INTEGER DEFAULT 0,
        PRIMARY KEY (owner_id, chat_id)
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_messages (
        message_id SERIAL PRIMARY KEY,
        owner_id TEXT NOT NULL,
        chat_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        read BOOLEAN DEFAULT false,
        reactions JSONB,
        type TEXT NOT NULL,
        file_name TEXT,
        reply_to JSONB,
        forwarded BOOLEAN DEFAULT false
      );
    `);

    await client.query('COMMIT');
    console.log('Database schema checked/created successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error initializing database schema, transaction rolled back.', err);
    throw err;
  } finally {
    client.release();
  }
}

// Inicializa o banco de dados na primeira carga do módulo
initializeDatabase().catch(err => {
    console.error("Failed to initialize database on startup:", err);
    process.exit(1);
});
