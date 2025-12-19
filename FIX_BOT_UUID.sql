-- Fix bot UUID issue and RLS policies

-- First, let's create a proper bot user in the profiles table
INSERT INTO profiles (id, full_name, phone, language, region, crops)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'AgriSaarthi Bot',
    'bot',
    'en',
    'Global',
    '{}'
) ON CONFLICT (id) DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow bot profile creation" ON profiles;

-- Create new policies that allow profile creation
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow profile creation for authenticated users
CREATE POLICY "Authenticated users can insert profiles" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix chats policies
DROP POLICY IF EXISTS "Users can view chats they participate in" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Users can update chats they participate in" ON chats;

CREATE POLICY "Users can view chats they participate in" ON chats
    FOR SELECT USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can create chats" ON chats
    FOR INSERT WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can update chats they participate in" ON chats
    FOR UPDATE USING (auth.uid() = participant_a OR auth.uid() = participant_b);

-- Fix messages policies
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;
DROP POLICY IF EXISTS "Allow bot messages" ON messages;

CREATE POLICY "Users can view messages in their chats" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.participant_a = auth.uid() OR chats.participant_b = auth.uid())
        )
    );

CREATE POLICY "Users can insert messages in their chats" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.participant_a = auth.uid() OR chats.participant_b = auth.uid())
        )
    );

-- Allow bot to send messages (using proper UUID)
CREATE POLICY "Allow bot messages" ON messages
    FOR INSERT WITH CHECK (sender_id = '00000000-0000-0000-0000-000000000001'::uuid OR auth.uid() = sender_id);
