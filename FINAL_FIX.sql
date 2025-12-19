-- Final fix for bot and RLS policies

-- First, let's modify the profiles table to allow NULL for bot users
ALTER TABLE profiles ALTER COLUMN id DROP NOT NULL;
ALTER TABLE profiles ADD COLUMN bot_id TEXT UNIQUE;

-- Insert bot profile without foreign key constraint
INSERT INTO profiles (bot_id, full_name, phone, language, region, crops)
VALUES (
    'bot-agrisaarthi',
    'AgriSaarthi Bot',
    'bot',
    'en',
    'Global',
    '{}'
) ON CONFLICT (bot_id) DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow bot profile creation" ON profiles;

-- Create new policies that allow profile creation
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR bot_id IS NOT NULL);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow profile creation for authenticated users
CREATE POLICY "Authenticated users can insert profiles" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix chats policies to handle bot chats
DROP POLICY IF EXISTS "Users can view chats they participate in" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Users can update chats they participate in" ON chats;

CREATE POLICY "Users can view chats they participate in" ON chats
    FOR SELECT USING (
        auth.uid() = participant_a OR 
        auth.uid() = participant_b OR 
        participant_b = 'bot-agrisaarthi'
    );

CREATE POLICY "Users can create chats" ON chats
    FOR INSERT WITH CHECK (
        auth.uid() = participant_a OR 
        (participant_b = 'bot-agrisaarthi' AND auth.uid() = participant_a)
    );

CREATE POLICY "Users can update chats they participate in" ON chats
    FOR UPDATE USING (
        auth.uid() = participant_a OR 
        auth.uid() = participant_b OR 
        participant_b = 'bot-agrisaarthi'
    );

-- Fix messages policies
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;
DROP POLICY IF EXISTS "Allow bot messages" ON messages;

CREATE POLICY "Users can view messages in their chats" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.participant_a = auth.uid() OR chats.participant_b = auth.uid() OR chats.participant_b = 'bot-agrisaarthi')
        )
    );

CREATE POLICY "Users can insert messages in their chats" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.participant_a = auth.uid() OR chats.participant_b = auth.uid() OR chats.participant_b = 'bot-agrisaarthi')
        )
    );

-- Allow bot to send messages
CREATE POLICY "Allow bot messages" ON messages
    FOR INSERT WITH CHECK (sender_id = 'bot-agrisaarthi' OR auth.uid() = sender_id);
