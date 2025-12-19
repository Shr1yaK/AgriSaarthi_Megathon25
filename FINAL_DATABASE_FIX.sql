-- Final database fix - change participant_b to TEXT to allow bot IDs

-- First, let's modify the chats table to allow text for participant_b
ALTER TABLE chats ALTER COLUMN participant_b TYPE TEXT;

-- Also modify messages table to allow text for sender_id
ALTER TABLE messages ALTER COLUMN sender_id TYPE TEXT;

-- Create a bot profile entry
INSERT INTO profiles (id, full_name, phone, language, region, crops)
VALUES (
    gen_random_uuid(),
    'AgriSaarthi Bot',
    'bot',
    'en',
    'Global',
    '{}'
) ON CONFLICT DO NOTHING;

-- Disable RLS completely for now
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
