-- Drop foreign key constraints first, then modify columns

-- Drop foreign key constraints
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_participant_a_fkey;
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_participant_b_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_chat_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- Now modify the columns
ALTER TABLE chats ALTER COLUMN participant_b TYPE TEXT;
ALTER TABLE messages ALTER COLUMN sender_id TYPE TEXT;

-- Disable RLS completely
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
