-- Fix foreign key constraint violation on profiles table
-- This removes the foreign key constraint since we're using custom authentication

-- Step 1: Drop the foreign key constraint on profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 2: Make the id column a regular UUID primary key (not referencing auth.users)
-- First, let's check if we need to modify the column
-- The id column should already be UUID, we just need to remove the foreign key reference

-- Step 3: Update chats table to handle both UUID and TEXT for participants
-- This allows for both user UUIDs and bot identifiers like 'bot-agrisaarthi'
ALTER TABLE chats ALTER COLUMN participant_a TYPE TEXT;
ALTER TABLE chats ALTER COLUMN participant_b TYPE TEXT;

-- Step 4: Update messages table to handle both UUID and TEXT for sender_id
ALTER TABLE messages ALTER COLUMN sender_id TYPE TEXT;

-- Step 5: Disable RLS to allow profile creation during signup
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Step 6: Create a bot profile entry (if it doesn't exist)
INSERT INTO profiles (id, full_name, phone, language, region, crops, email, password_hash)
VALUES (
    'bot-agrisaarthi',
    'AgriSaarthi Bot',
    'bot',
    'en',
    'Global',
    '{}',
    'bot@agrisaarthi.com',
    'bot_password'
) ON CONFLICT (id) DO NOTHING;

-- Step 7: Re-enable RLS with permissive policies for custom authentication
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create permissive policies that work with custom authentication
CREATE POLICY "Allow all profile operations" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all chat operations" ON chats FOR ALL USING (true);
CREATE POLICY "Allow all message operations" ON messages FOR ALL USING (true);

-- Optional: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_chats_participants ON chats(participant_a, participant_b);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
